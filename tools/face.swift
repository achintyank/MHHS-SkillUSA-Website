// Print the bounding box of the largest face in an image, as
//     x y w h   (fractions of the image, origin top-left)
// so a crop can be centred on a person instead of on the middle of the frame.
// Exits non-zero and prints nothing when there is no face to find.
import Foundation
import Vision
import CoreImage

func die(_ m: String) -> Never { FileHandle.standardError.write((m + "\n").data(using: .utf8)!); exit(1) }

let args = CommandLine.arguments
guard args.count == 2 else { die("usage: face <image>") }
guard let img = CIImage(contentsOf: URL(fileURLWithPath: args[1]), options: [.applyOrientationProperty: true])
else { die("could not read \(args[1])") }

let req = VNDetectFaceRectanglesRequest()
let handler = VNImageRequestHandler(ciImage: img)
do { try handler.perform([req]) } catch { die("vision failed: \(error)") }

guard let faces = req.results, !faces.isEmpty else { die("no face") }

// largest by area: in a group shot that is the person the photo is of
let best = faces.max(by: { $0.boundingBox.width * $0.boundingBox.height
                         < $1.boundingBox.width * $1.boundingBox.height })!
let b = best.boundingBox          // Vision's origin is bottom-left
print(String(format: "%.5f %.5f %.5f %.5f %d",
             b.origin.x, 1 - b.origin.y - b.height, b.width, b.height, faces.count))
