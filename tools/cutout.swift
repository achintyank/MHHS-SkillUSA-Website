// Lift the subject out of a photograph, the same way Preview's "Remove
// Background" does. Vision finds the foreground instances; we mask to all of
// them at once so a group photo keeps everyone.
import Foundation
import Vision
import CoreImage
import AppKit

func die(_ m: String) -> Never { FileHandle.standardError.write((m + "\n").data(using: .utf8)!); exit(1) }

let args = CommandLine.arguments
guard args.count == 3 else { die("usage: cutout <in> <out.png>") }

guard let src = CIImage(contentsOf: URL(fileURLWithPath: args[1]), options: [.applyOrientationProperty: true])
else { die("could not read \(args[1])") }

let req = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(ciImage: src)
do { try handler.perform([req]) } catch { die("vision failed: \(error)") }

guard let obs = req.results?.first, !obs.allInstances.isEmpty else { die("no subject found") }

let buf: CVPixelBuffer
do {
    buf = try obs.generateMaskedImage(ofInstances: obs.allInstances,
                                      from: handler,
                                      croppedToInstancesExtent: false)
} catch { die("mask failed: \(error)") }

let out = CIImage(cvPixelBuffer: buf)
let ctx = CIContext()
guard let png = ctx.pngRepresentation(of: out,
                                      format: .RGBA8,
                                      colorSpace: CGColorSpaceCreateDeviceRGB())
else { die("encode failed") }
try! png.write(to: URL(fileURLWithPath: args[2]))
print("\(obs.allInstances.count) instance(s) -> \(args[2])")
