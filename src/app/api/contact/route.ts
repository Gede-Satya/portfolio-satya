import { NextResponse } from "next/server";
import {
  getMessagesAsync,
  saveMessageAsync,
  updateMessageReadAsync,
  deleteMessageAsync,
  ContactMessage,
} from "@/lib/storage";

export async function GET() {
  try {
    const messages = await getMessagesAsync();
    const unreadCount = messages.filter((m) => !m.read).length;
    return NextResponse.json({
      success: true,
      data: messages,
      unreadCount,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat pesan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Nama, email, dan pesan wajib diisi" },
        { status: 400 }
      );
    }

    const newMessage: ContactMessage = {
      id: "msg-" + Date.now(),
      name,
      email,
      subject: subject || "General Inquiry",
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };

    await saveMessageAsync(newMessage);

    return NextResponse.json({
      success: true,
      message: "Pesan Anda berhasil dikirim!",
      data: newMessage,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengirim pesan" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, read } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID pesan diperlukan" },
        { status: 400 }
      );
    }

    const messages = await getMessagesAsync();
    const msg = messages.find((m) => m.id === id);

    if (!msg) {
      return NextResponse.json(
        { success: false, message: "Pesan tidak ditemukan" },
        { status: 404 }
      );
    }

    const targetRead = read !== undefined ? read : !msg.read;
    await updateMessageReadAsync(id, targetRead);

    return NextResponse.json({
      success: true,
      message: "Status pesan diperbarui",
      data: { ...msg, read: targetRead },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status pesan" },
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
        { success: false, message: "ID pesan diperlukan" },
        { status: 400 }
      );
    }

    await deleteMessageAsync(id);

    return NextResponse.json({
      success: true,
      message: "Pesan berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus pesan" },
      { status: 500 }
    );
  }
}
