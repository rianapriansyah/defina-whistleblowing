"""Generate Dokumen Panduan Penggunaan Aplikasi (Indonesian) as PDF for Defina Whistleblowing."""

from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parent.parent / "docs" / "panduan-penggunaan-defina-whistleblowing.pdf"


class PanduanPDF(FPDF):
    def footer(self) -> None:
        self.set_y(-15)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, f"Halaman {self.page_no()}", align="C")


def section_title(pdf: FPDF, title: str) -> None:
    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(20, 40, 80)
    pdf.multi_cell(0, 8, title, ln=1)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 11)
    pdf.ln(2)


def body(pdf: FPDF, text: str) -> None:
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 6, text, ln=1)
    pdf.ln(1)


def bullet(pdf: FPDF, items: list[str]) -> None:
    pdf.set_font("Helvetica", "", 11)
    for item in items:
        pdf.multi_cell(0, 6, f"- {item}", ln=1)
    pdf.ln(1)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)

    pdf = PanduanPDF()
    pdf.set_margins(16, 16, 16)
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(20, 40, 80)
    pdf.cell(0, 10, "Dokumen Panduan Penggunaan Aplikasi", ln=1)
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(0, 7, "Defina Whistleblowing", ln=1)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(
        0,
        5,
        "Panduan ini menjelaskan cara menggunakan aplikasi pengelolaan pengaduan whistleblowing: mulai dari pengajuan pengaduan oleh pelapor, pelacakan status, hingga penanganan oleh petugas.",
        ln=1,
    )

    section_title(pdf, "1. Pengenalan singkat")
    body(
        pdf,
        "Aplikasi ini digunakan untuk menerima pengaduan secara aman, melacak perkembangan "
        "berdasarkan nomor dan password pengaduan, serta mendukung analisis dan tindak lanjut oleh "
        "petugas yang telah masuk (login). Administrator dapat mengundang stakeholder melalui email.",
    )

    section_title(pdf, "2. Untuk pelapor (publik)")
    body(
        pdf,
        "Halaman utama berisi formulir pengaduan. Anda tidak perlu membuat akun untuk mengirim pengaduan.",
    )
    bullet(
        pdf,
        [
            "Anonimitas: Aktifkan opsi anonim bila Anda tidak ingin mengisi identitas; nonaktifkan jika ingin menyertakan nama, email, telepon, status pelapor, dan unit kerja.",
            "Isi ringkasan: judul, deskripsi kejadian, tanggal kejadian (jika ada), lokasi, dan kategori (misalnya Penipuan, Korupsi, Pelecehan, Diskriminasi, Keselamatan, Lainnya).",
            "Lampiran: Unggah berkas pendukung (gambar JPG/PNG atau PDF), sesuai batas ukuran yang ditampilkan di formulir.",
            "Pernyataan: Setujui pernyataan yang disyaratkan sebelum mengirim.",
            "Setelah berhasil: Simpan nomor pengaduan dan password satu kali yang ditampilkan pada dialog "
            "konfirmasi. Keduanya diperlukan untuk melacak status pengaduan Anda.",
        ],
    )

    section_title(pdf, "3. Melacak pengaduan")
    body(
        pdf,
        "Buka menu atau tautan Lacak Pengaduan. Masukkan nomor pengaduan dan password yang Anda "
        "terima saat pengiriman. Anda akan melihat ringkasan status, penugasan, ringkasan penyelesaian "
        "(jika ada), serta detail pengaduan yang relevan.",
    )

    section_title(pdf, "4. Untuk petugas (pengguna terdaftar)")
    body(
        pdf,
        "Petugas menggunakan akun email dan kata sandi yang diberikan. Masuk melalui halaman login.",
    )
    bullet(
        pdf,
        [
            "Dashboard: Menampilkan jumlah pengaduan total dan ringkasan menurut tingkat keparahan (rendah hingga kritis). Kartu dapat diklik untuk membuka tampilan investigasi dengan filter yang sesuai.",
            "Investigasi & Analisis: Daftar pengaduan dengan pencarian dan filter (kata kunci, tanggal kejadian, kategori, tingkat keparahan). Buka tindakan pada sebuah baris untuk memperbarui status, "
            "keparahan, penugasan, catatan, dan informasi penyelesaian sesuai hak akses Anda.",
        ],
    )

    section_title(pdf, "5. Administrator: undangan stakeholder")
    body(
        pdf,
        "Hanya akun dengan peran admin yang dapat membuka halaman undangan stakeholder. Di sana admin dapat melihat ringkasan stakeholder, mengirim undangan email (nama, email, jabatan, catatan), "
        "dan memantau status undangan. Penerima undangan menyelesaikan proses melalui tautan yang dikirim (halaman selesai undangan) untuk mengaktifkan akses sesuai kebijakan organisasi Anda.",
    )

    section_title(pdf, "6. Tips keamanan")
    bullet(
        pdf,
        [
            "Jangan membagikan password pengaduan kepada pihak yang tidak berkepentingan.",
            "Simpan nomor dan password di tempat yang aman; layanan tidak dapat mengirim ulang password lama secara publik.",
            "Keluhan sensitif hindari penggunaan jaringan tidak tepercaya jika memungkinkan.",
        ],
    )

    section_title(pdf, "7. Dukungan")
    body(
        pdf,
        "Bila mengalami kendala teknis, hubungi administrator sistem atau tim IT yang mengelola aplikasi Defina Whistleblowing di organisasi Anda.",
    )

    pdf.output(str(OUT))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
