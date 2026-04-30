
import { FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { HelpTooltip } from '@/components/help/HelpTooltip';

interface AttachmentsSectionProps {
  selectedImage: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AttachmentsSection({ selectedImage, onFileChange }: AttachmentsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg inline-flex items-center gap-1">
          Pièces jointes
          <HelpTooltip contentKey="time.field.attachment" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={onFileChange}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <FileImage className="mr-2 h-4 w-4" />
            Ajouter une photo
          </Button>
          
          {selectedImage && (
            <div className="relative w-24 h-24">
              <img
                src={selectedImage}
                alt="Uploaded"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
