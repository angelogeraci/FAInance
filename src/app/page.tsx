import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bienvenue sur la nouvelle UI shadcn/ui ✨</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Ouvrir le dialogue</Button>
            </DialogTrigger>
            <DialogContent>
              <p>Bravo, tu utilises maintenant une UI moderne, flexible et design !</p>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </main>
  )
}
