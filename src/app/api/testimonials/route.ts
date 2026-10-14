import { NextResponse } from "next/server";
import { getPortfolioContentAsync, savePortfolioContentAsync } from "@/lib/storage";
import { TestimonialItem } from "@/types/portfolio";

export async function GET() {
  try {
    const content = await getPortfolioContentAsync();
    return NextResponse.json({
      success: true,
      data: content.testimonials || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data rekomendasi rekan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newItem: TestimonialItem = await request.json();
    if (!newItem.author?.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama pemberi rekomendasi wajib diisi" },
        { status: 400 }
      );
    }
    if (!newItem.quote?.id?.trim() && !newItem.quote?.en?.trim()) {
      return NextResponse.json(
        { success: false, message: "Isi ulasan / rekomendasi wajib diisi" },
        { status: 400 }
      );
    }

    const content = await getPortfolioContentAsync();

    if (!newItem.id) {
      newItem.id = "testi-" + Date.now();
    }

    if (!newItem.initials?.trim()) {
      const parts = newItem.author.trim().split(" ");
      newItem.initials = parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }

    if (!newItem.quote.en) {
      newItem.quote.en = newItem.quote.id;
    }
    if (!newItem.quote.id) {
      newItem.quote.id = newItem.quote.en;
    }

    const rawRating = Number(newItem.rating);
    newItem.rating = !isNaN(rawRating) ? Math.min(5, Math.max(1, Math.round(rawRating))) : 5;
    newItem.createdAt = newItem.createdAt || new Date().toISOString();
    newItem.role = newItem.role?.trim() || "Rekan Kolaborasi";
    newItem.visible = newItem.visible !== false;

    content.testimonials = [newItem, ...(content.testimonials || [])];
    await savePortfolioContentAsync(content);

    return NextResponse.json({
      success: true,
      message: "Rekomendasi rekan berhasil ditambahkan",
      data: newItem,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan rekomendasi rekan" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const updatedItem: TestimonialItem = await request.json();
    if (!updatedItem.id) {
      return NextResponse.json(
        { success: false, message: "ID rekomendasi diperlukan" },
        { status: 400 }
      );
    }

    const content = await getPortfolioContentAsync();
    const list = content.testimonials || [];
    const index = list.findIndex((t) => t.id === updatedItem.id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Rekomendasi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!updatedItem.initials?.trim() && updatedItem.author) {
      const parts = updatedItem.author.trim().split(" ");
      updatedItem.initials = parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }

    list[index] = {
      ...list[index],
      ...updatedItem,
    };
    content.testimonials = list;

    await savePortfolioContentAsync(content);

    return NextResponse.json({
      success: true,
      message: "Rekomendasi rekan berhasil diperbarui",
      data: list[index],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui rekomendasi rekan" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID rekomendasi diperlukan" },
        { status: 400 }
      );
    }

    const content = await getPortfolioContentAsync();
    const initialLen = (content.testimonials || []).length;
    content.testimonials = (content.testimonials || []).filter((t) => t.id !== id);

    if (content.testimonials.length === initialLen) {
      return NextResponse.json(
        { success: false, message: "Rekomendasi tidak ditemukan" },
        { status: 404 }
      );
    }

    await savePortfolioContentAsync(content);

    return NextResponse.json({
      success: true,
      message: "Rekomendasi rekan berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus rekomendasi rekan" },
      { status: 500 }
    );
  }
}
