// macOS : swift tools/render-press-kits.swift
// À relancer après remplacement des PDF ; aucune dépendance côté site.
import Foundation
import AppKit
import PDFKit

let sources = [("horizontal", "PRESS KIT HORIZONTAL_compressed.pdf"), ("vertical", "PRESS KIT VERTICALE.pdf")]
let annotationsOnly = CommandLine.arguments.contains("--annotations-only")
var manifest: [String: Any] = [:]
for (version, source) in sources {
    guard let document = PDFDocument(url: URL(fileURLWithPath: source)) else { fatalError("PDF illisible : \(source)") }
    let directory = "assets/press-kit/\(version)"
    try FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)
    var pages: [[String: Any]] = []
    for index in 0..<document.pageCount {
        try autoreleasepool {
            guard let page = document.page(at: index) else { fatalError("Page absente") }
            let bounds = page.bounds(for: .mediaBox)
            let scale = 2400.0 / max(bounds.width, bounds.height)
            let size = NSSize(width: bounds.width * scale, height: bounds.height * scale)
            let path = "\(directory)/page-\(index + 1).jpg"
            let bitmap: NSBitmapImageRep
            if annotationsOnly {
                bitmap = NSBitmapImageRep(data: try Data(contentsOf: URL(fileURLWithPath: path)))!
            } else {
                let image = page.thumbnail(of: size, for: .mediaBox)
                guard let tiff = image.tiffRepresentation, let rendered = NSBitmapImageRep(data: tiff),
                      let data = rendered.representation(using: .jpeg, properties: [.compressionFactor: 0.9]) else { fatalError("Export impossible") }
                bitmap = rendered
                try data.write(to: URL(fileURLWithPath: path))
            }
            // PDF : origine en bas à gauche ; HTML : origine en haut à gauche.
            // Les documents actuels ne comportent ni rotation ni autre type d'action.
            guard page.rotation == 0 else { fatalError("Rotation à prendre en charge avant export") }
            var links: [[String: Any]] = []
            for annotation in page.annotations where annotation.type == "Link" {
                guard let url = annotation.url ?? (annotation.action as? PDFActionURL)?.url else {
                    fatalError("Annotation non URL à prendre en charge avant export")
                }
                let rect = annotation.bounds
                let label = page.selection(for: rect)?.string?.trimmingCharacters(in: .whitespacesAndNewlines)
                links.append([
                    "url": url.absoluteString,
                    "label": label?.isEmpty == false ? label! : url.absoluteString,
                    "x": (rect.minX - bounds.minX) / bounds.width,
                    "y": (bounds.maxY - rect.maxY) / bounds.height,
                    "width": rect.width / bounds.width,
                    "height": rect.height / bounds.height
                ])
            }
            pages.append(["src": path, "width": bitmap.pixelsWide, "height": bitmap.pixelsHigh,
                          "text": page.string ?? "", "links": links])
        }
    }
    manifest[version] = pages
    print("\(source) : \(pages.count) pages")
}
let data = try JSONSerialization.data(withJSONObject: manifest, options: [.sortedKeys])
let script = "// Généré depuis les PDF par tools/render-press-kits.swift.\nwindow.pressKitPages = " + String(data: data, encoding: .utf8)! + ";\n"
try script.write(toFile: "assets/press-kit/pages.js", atomically: true, encoding: .utf8)
