import { NextResponse } from "next/server";
import { getAdminCredentialsAsync, updateAdminCredentialsAsync } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const creds = await getAdminCredentialsAsync();

    if (username === creds.username && password === creds.passwordHash) {
      return NextResponse.json({
        success: true,
        message: "Login berhasil",
        token: "admin-authenticated-token",
        user: { username: creds.username },
      });
    }

    return NextResponse.json(
      { success: false, message: "Username atau password salah" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { username, currentPassword, newPassword } = await request.json();
    const creds = await getAdminCredentialsAsync();

    if (currentPassword !== creds.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Password saat ini tidak cocok" },
        { status: 400 }
      );
    }

    const updatedUser = username || creds.username;
    const updatedPass = newPassword || creds.passwordHash;
    await updateAdminCredentialsAsync(updatedUser, updatedPass);

    return NextResponse.json({
      success: true,
      message: "Kredensial admin berhasil diperbarui",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
