package com.devmastery.progress.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Slf4j
public class CertificateService {

    public byte[] generateCertificate(UUID userId, String userName, String pathName) {
        log.info("Generating certificate for user {} for path {}", userId, pathName);
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("DevMastery")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(32)
                    .setBold());

            document.add(new Paragraph("Certificate of Completion")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(24)
                    .setMarginTop(30));

            document.add(new Paragraph("This certifies that")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(16)
                    .setMarginTop(20));

            document.add(new Paragraph(userName)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(28)
                    .setBold()
                    .setMarginTop(10));

            document.add(new Paragraph("has successfully completed the learning path")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(16)
                    .setMarginTop(10));

            document.add(new Paragraph(pathName)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(22)
                    .setItalic()
                    .setMarginTop(10));

            document.add(new Paragraph("Date: " + LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFontSize(14)
                    .setMarginTop(50));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF certificate", e);
            throw new RuntimeException("Certificate generation failed", e);
        }
    }
}
