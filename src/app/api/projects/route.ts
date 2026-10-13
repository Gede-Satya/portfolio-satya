import { NextResponse } from "next/server";
import { getPortfolioContent, savePortfolioContent } from "@/lib/storage";
import { ProjectItem } from "@/types/portfolio";

export async function POST(request: Request) {
  try {
    const newProject: ProjectItem = await request.json();
    if (!newProject.title) {
      return NextResponse.json(
        { success: false, message: "Judul proyek wajib diisi" },
        { status: 400 }
      );
    }

    const content = getPortfolioContent();
    if (!newProject.id) {
      newProject.id = "proj-" + Date.now();
    }

    content.projects = [newProject, ...content.projects];
    savePortfolioContent(content);

    return NextResponse.json({
      success: true,
      message: "Proyek berhasil ditambahkan",
      data: newProject,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan proyek" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const updatedProject: ProjectItem = await request.json();
    if (!updatedProject.id) {
      return NextResponse.json(
        { success: false, message: "ID proyek diperlukan" },
        { status: 400 }
      );
    }

    const content = getPortfolioContent();
    const index = content.projects.findIndex((p) => p.id === updatedProject.id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    content.projects[index] = {
      ...content.projects[index],
      ...updatedProject,
    };

    savePortfolioContent(content);

    return NextResponse.json({
      success: true,
      message: "Proyek berhasil diperbarui",
      data: content.projects[index],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui proyek" },
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
        { success: false, message: "ID proyek diperlukan" },
        { status: 400 }
      );
    }

    const content = getPortfolioContent();
    const initialLen = content.projects.length;
    content.projects = content.projects.filter((p) => p.id !== id);

    if (content.projects.length === initialLen) {
      return NextResponse.json(
        { success: false, message: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    savePortfolioContent(content);

    return NextResponse.json({
      success: true,
      message: "Proyek berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus proyek" },
      { status: 500 }
    );
  }
}
