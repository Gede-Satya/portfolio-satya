import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file yang diunggah" },
        { status: 400 }
      );
    }

    // Validasi format file gambar & dokumen (CV / Resume)
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    const validDocTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ];

    const ext = path.extname(file.name).toLowerCase() || (file.type === "application/pdf" ? ".pdf" : ".jpg");
    const isDocExtension = [".pdf", ".doc", ".docx"].includes(ext);
    const isImageExtension = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext);

    const isImage = validImageTypes.includes(file.type) || isImageExtension;
    const isDoc = validDocTypes.includes(file.type) || isDocExtension;

    if (!isImage && !isDoc) {
      return NextResponse.json(
        {
          success: false,
          message: "Format file tidak didukung. Gunakan JPG, PNG, WebP, SVG, PDF, atau DOCX.",
        },
        { status: 400 }
      );
    }

    // Batasi ukuran maksimal 15MB untuk gambar & dokumen
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran file terlalu besar (maksimal 15MB)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitasi nama file & tambahkan timestamp unik
    const baseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${baseName}-${Date.now()}${ext}`;

    // If Supabase is configured, upload to Supabase Storage bucket
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: uploadError } = await supabase.storage
          .from("portfolio-uploads")
          .upload(filename, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from("portfolio-uploads")
            .getPublicUrl(filename);

          return NextResponse.json({
            success: true,
            message: "Gambar berhasil diunggah ke Supabase Storage",
            url: publicData.publicUrl,
            filename,
          });
        }
        console.warn("Supabase storage upload error, fallback to local:", uploadError);
      } catch (err) {
        console.warn("Supabase storage upload exception, fallback to local:", err);
      }
    }

    // Local fallback
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
    } catch (fsErr) {
      console.warn("Local upload write skipped:", fsErr);
    }

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      message: "Gambar berhasil diunggah",
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses unggahan file" },
      { status: 500 }
    );
  }
}
