import { NextResponse } from "next/server";
import { getPortfolioContentAsync, savePortfolioContentAsync } from "@/lib/storage";
import { TimelineItem } from "@/types/portfolio";

export async function POST(request: Request) {
  try {
    const newItem: TimelineItem = await request.json();
    if (!newItem.company) {
      return NextResponse.json(
        { success: false, message: "Perusahaan atau institusi wajib diisi" },
        { status: 400 }
      );
    }

    const content = await getPortfolioContentAsync();
    if (!newItem.id) {
      newItem.id = "time-" + Date.now();
    }

    content.timeline = [newItem, ...content.timeline];
    await savePortfolioContentAsync(content);

    return NextResponse.json({
      success: true,
      message: "Riwayat pengalaman berhasil ditambahkan",
      data: newItem,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan timeline" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const updatedItem: TimelineItem = await request.json();
    if (!updatedItem.id) {
      return NextResponse.json(
        { success: false, message: "ID timeline diperlukan" },
        { status: 400 }
      );
    }

    const content = await getPortfolioContentAsync();
    const index = content.timeline.findIndex((t) => t.id === updatedItem.id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Riwayat tidak ditemukan" },
        { status: 404 }
      );
    }

    content.timeline[index] = {
      ...content.timeline[index],
      ...updatedItem,
    };

    await savePortfolioContentAsync(content);

    return NextResponse.json({
      success: true,
      message: "Riwayat berhasil diperbarui",
      data: content.timeline[index],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui riwayat" },
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
        { success: false, message: "ID timeline diperlukan" },
        { status: 400 }
      );
    }

    const content = await getPortfolioContentAsync();
    const initialLen = content.timeline.length;
    content.timeline = content.timeline.filter((t) => t.id !== id);

    if (content.timeline.length === initialLen) {
      return NextResponse.json(
        { success: false, message: "Riwayat tidak ditemukan" },
        { status: 404 }
      );
    }

    await savePortfolioContentAsync(content);

    return NextResponse.json({
      success: true,
      message: "Riwayat berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus riwayat" },
      { status: 500 }
    );
  }
}
