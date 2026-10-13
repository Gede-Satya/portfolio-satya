import { NextResponse } from "next/server";
import { getPortfolioContentAsync, savePortfolioContentAsync } from "@/lib/storage";
import { SkillItem } from "@/types/portfolio";

export async function POST(request: Request) {
  try {
    const newSkill: SkillItem = await request.json();
    if (!newSkill.name) {
      return NextResponse.json(
        { success: false, message: "Nama keahlian wajib diisi" },
        { status: 400 }
      );
    }

    const content = await getPortfolioContentAsync();
    content.skills = [newSkill, ...content.skills];
    await savePortfolioContentAsync(content);

    return NextResponse.json({
      success: true,
      message: "Keahlian baru berhasil ditambahkan",
      data: newSkill,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan keahlian" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { originalName, ...updatedSkill } = await request.json();
    const content = await getPortfolioContentAsync();
    const lookup = originalName || updatedSkill.name;
    const index = content.skills.findIndex((s) => s.name === lookup);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Keahlian tidak ditemukan" },
        { status: 404 }
      );
    }

    content.skills[index] = {
      ...content.skills[index],
      ...updatedSkill,
    };

    await savePortfolioContentAsync(content);

    return NextResponse.json({
      success: true,
      message: "Keahlian berhasil diperbarui",
      data: content.skills[index],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui keahlian" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama keahlian diperlukan" },
        { status: 400 }
      );
    }

    const content = await getPortfolioContentAsync();
    const initialLen = content.skills.length;
    content.skills = content.skills.filter((s) => s.name !== name);

    if (content.skills.length === initialLen) {
      return NextResponse.json(
        { success: false, message: "Keahlian tidak ditemukan" },
        { status: 404 }
      );
    }

    await savePortfolioContentAsync(content);

    return NextResponse.json({
      success: true,
      message: "Keahlian berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus keahlian" },
      { status: 500 }
    );
  }
}
