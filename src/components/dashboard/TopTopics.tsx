import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const topics = [
  { name: "Pendaftaran", percentage: 0 },
  { name: "Biaya Kuliah", percentage: 0 },
  { name: "Jadwal", percentage: 0 },
  { name: "Beasiswa", percentage: 0 },
  { name: "Fasilitas", percentage: 0 },
]

export function TopTopics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Topik yang sering dibincangkan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {topics.map((topic) => (
            <div key={topic.name} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">{topic.name}</span>
                <span className="text-muted-foreground">{topic.percentage}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${topic.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
