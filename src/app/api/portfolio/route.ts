import { NextResponse } from "next/server";
import {
  getPortfolioContentAsync,
  savePortfolioContentAsync,
  resetToDefaultContentAsync,
} from "@/lib/storage";

export async function GET() {
  try {
    const data = await getPortfolioContentAsync();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat data portofolio" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "reset") {
      const resetData = await resetToDefaultContentAsync();
      return NextResponse.json({
        success: true,
        message: "Data portofolio berhasil di-reset ke nilai default",
        data: resetData,
      });
    }

    const current = await getPortfolioContentAsync();

    if (body.profile) {
      current.profile = {
        ...current.profile,
        ...body.profile,
      };
    }

    if (body.about) {
      current.about = {
        ...current.about,
        ...body.about,
      };
    }

    if (body.heroStats) {
      current.heroStats = {
        ...current.heroStats,
        ...body.heroStats,
      };
    }

    if (body.testimonials) {
      current.testimonials = body.testimonials;
    }

    if (body.fullContent) {
      await savePortfolioContentAsync(body.fullContent);
      return NextResponse.json({
        success: true,
        message: "Seluruh konten portofolio berhasil disimpan",
        data: body.fullContent,
      });
    }

    await savePortfolioContentAsync(current);
    return NextResponse.json({
      success: true,
      message: "Profil portofolio berhasil diperbarui",
      data: current,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data" },
      { status: 500 }
    );
  }
}
