package com.devmastery.profile.internal;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Generates a professional A4-landscape PDF certificate using iText 7 Community.
 * <p>
 * No external font files needed — uses the PDF standard fonts (Helvetica / Times).
 * The QR code links to the public verification endpoint.
 */
@Component
class PdfCertificateGenerator {

    private static final Logger log = LoggerFactory.getLogger(PdfCertificateGenerator.class);

    // ── Brand colours ──────────────────────────────────────────────
    private static final DeviceRgb NAVY      = new DeviceRgb(0x1E, 0x3A, 0x5F);
    private static final DeviceRgb GOLD      = new DeviceRgb(0xF5, 0x9E, 0x0B);
    private static final DeviceRgb LIGHT_BG  = new DeviceRgb(0xF8, 0xF9, 0xFA);
    private static final DeviceRgb GREY_TEXT = new DeviceRgb(0x6B, 0x72, 0x80);
    private static final DeviceRgb WHITE     = new DeviceRgb(0xFF, 0xFF, 0xFF);

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("MMMM d, yyyy").withZone(ZoneOffset.UTC);

    /**
     * @param learnerName   Display name / email of the learner
     * @param pathTitle     Learning path title (e.g. "Java Mastery Path")
     * @param totalTopics   Number of topics completed
     * @param avgQuizScore  Average quiz accuracy (0–100), may be null
     * @param issuedAt      Certificate issue timestamp
     * @param credentialId  Unique credential UUID for verification link
     * @param appBaseUrl    Public app URL (e.g. "https://devmastery.io")
     * @return              PDF bytes
     */
    byte[] generate(
            String learnerName,
            String pathTitle,
            int totalTopics,
            Double avgQuizScore,
            Instant issuedAt,
            UUID credentialId,
            String appBaseUrl) {

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter  writer  = new PdfWriter(baos);
            PdfDocument pdf    = new PdfDocument(writer);
            PageSize   page    = PageSize.A4.rotate();            // 841 × 595 pt
            Document   doc    = new Document(pdf, page);
            doc.setMargins(0, 0, 0, 0);

            PdfFont bold   = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normal = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont italic = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            float W = page.getWidth();   // 841 pt
            float H = page.getHeight();  // 595 pt

            // ── Full-page background ─────────────────────────────────
            Table bg = new Table(1)
                    .setWidth(W).setHeight(H)
                    .setBackgroundColor(LIGHT_BG)
                    .setBorder(Border.NO_BORDER);
            bg.addCell(new Cell().setBorder(Border.NO_BORDER));
            doc.add(bg);

            // ── Top header band ──────────────────────────────────────
            Table header = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .setWidth(W)
                    .setBackgroundColor(NAVY)
                    .setBorder(Border.NO_BORDER)
                    .setMarginTop(0);
            Cell headerCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setPadding(16)
                    .setTextAlignment(TextAlignment.CENTER);
            headerCell.add(new Paragraph("DEVMASTERY")
                    .setFont(bold).setFontSize(18).setFontColor(WHITE)
                    .setMarginBottom(0));
            headerCell.add(new Paragraph("Developer Learning Platform")
                    .setFont(italic).setFontSize(9).setFontColor(new DeviceRgb(0xBF, 0xC8, 0xD4))
                    .setMarginTop(2));
            header.addCell(headerCell);
            doc.add(header);

            // ── Gold accent rule ─────────────────────────────────────
            Table rule = new Table(1).setWidth(W)
                    .setBorder(Border.NO_BORDER)
                    .setBackgroundColor(GOLD);
            rule.addCell(new Cell().setBorder(Border.NO_BORDER).setHeight(4));
            doc.add(rule);

            // ── Main content area ────────────────────────────────────
            doc.setMargins(0, 48, 0, 48);

            // "Certificate of Completion"
            doc.add(new Paragraph("Certificate of Completion")
                    .setFont(bold).setFontSize(26).setFontColor(NAVY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(28).setMarginBottom(4));

            // Thin divider
            doc.add(new Paragraph()
                    .setBorderBottom(new SolidBorder(GOLD, 2))
                    .setMarginBottom(18));

            // "This certifies that"
            doc.add(new Paragraph("This certifies that")
                    .setFont(italic).setFontSize(11).setFontColor(GREY_TEXT)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(6));

            // Learner name
            doc.add(new Paragraph(learnerName)
                    .setFont(bold).setFontSize(30).setFontColor(NAVY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(6)
                    .setBorderBottom(new SolidBorder(NAVY, 1))
                    .setPaddingBottom(4));

            // "has successfully mastered all topics in"
            doc.add(new Paragraph("has successfully mastered all topics in")
                    .setFont(italic).setFontSize(11).setFontColor(GREY_TEXT)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(8).setMarginBottom(4));

            // Path title
            doc.add(new Paragraph(pathTitle)
                    .setFont(bold).setFontSize(18).setFontColor(NAVY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // ── Stats row ────────────────────────────────────────────
            Table stats = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}))
                    .setWidth(UnitValue.createPercentValue(70))
                    .setHorizontalAlignment(HorizontalAlignment.CENTER)
                    .setBorder(Border.NO_BORDER)
                    .setMarginBottom(16);

            stats.addCell(statCell(bold, normal, String.valueOf(totalTopics), "Topics Completed"));
            stats.addCell(statCell(bold, normal,
                    avgQuizScore != null ? String.format("%.0f%%", avgQuizScore) : "—",
                    "Avg Quiz Score"));
            stats.addCell(statCell(bold, normal, DATE_FMT.format(issuedAt), "Date Issued"));
            doc.add(stats);

            // ── Bottom credential strip ──────────────────────────────
            Table cred = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBorder(Border.NO_BORDER)
                    .setBackgroundColor(NAVY)
                    .setMarginTop(0);

            String verifyUrl = appBaseUrl + "/certificates/verify/" + credentialId;

            Cell credText = new Cell().setBorder(Border.NO_BORDER)
                    .setBackgroundColor(NAVY)
                    .setPadding(12).setVerticalAlignment(VerticalAlignment.MIDDLE);
            credText.add(new Paragraph("CREDENTIAL ID")
                    .setFont(bold).setFontSize(7).setFontColor(GOLD)
                    .setCharacterSpacing(1.5f).setMarginBottom(3));
            credText.add(new Paragraph(credentialId.toString())
                    .setFont(normal).setFontSize(9).setFontColor(WHITE)
                    .setMarginBottom(8));
            credText.add(new Paragraph("Verify online: " + verifyUrl)
                    .setFont(italic).setFontSize(8)
                    .setFontColor(new DeviceRgb(0xBF, 0xC8, 0xD4)));
            cred.addCell(credText);

            // QR code cell
            byte[] qrPng = generateQrCode(verifyUrl, 80);
            Cell qrCell = new Cell().setBorder(Border.NO_BORDER)
                    .setBackgroundColor(NAVY)
                    .setPadding(8).setVerticalAlignment(VerticalAlignment.MIDDLE)
                    .setTextAlignment(TextAlignment.CENTER);
            if (qrPng != null) {
                ImageData qrData = ImageDataFactory.create(qrPng);
                Image qrImg = new Image(qrData).setWidth(70).setHeight(70);
                qrCell.add(qrImg);
            }
            cred.addCell(qrCell);
            doc.add(cred);

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("PDF generation failed for credential {}", credentialId, e);
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    // ── helpers ───────────────────────────────────────────────────

    private static Cell statCell(PdfFont bold, PdfFont normal, String value, String label) {
        Cell c = new Cell().setBorder(Border.NO_BORDER)
                .setBackgroundColor(WHITE)
                .setBorderRight(new SolidBorder(LIGHT_BG, 2))
                .setPadding(10)
                .setTextAlignment(TextAlignment.CENTER);
        c.add(new Paragraph(value)
                .setFont(bold).setFontSize(16).setFontColor(NAVY).setMarginBottom(2));
        c.add(new Paragraph(label)
                .setFont(normal).setFontSize(8).setFontColor(GREY_TEXT));
        return c;
    }

    private static byte[] generateQrCode(String content, int size) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size);
            BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", out);
            return out.toByteArray();
        } catch (Exception e) {
            LoggerFactory.getLogger(PdfCertificateGenerator.class)
                    .warn("QR code generation failed for '{}': {}", content, e.getMessage());
            return null;
        }
    }
}

