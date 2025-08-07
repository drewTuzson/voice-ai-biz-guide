import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/Layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, CheckCircle, FileText, Mic } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface Profile {
  business_name: string | null
  industry: string | null
  company_size: string | null
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('business_name, industry, company_size')
        .eq('id', user!.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        toast({
          title: "Error",
          description: "Failed to load profile information.",
          variant: "destructive",
        })
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const displayName = profile?.business_name || user?.email?.split('@')[0] || 'there'

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {displayName}!
          </h1>
          <p className="text-muted-foreground">
            Ready to discover new AI opportunities for your business?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Voice Assessment</CardTitle>
              <CardDescription>
                Have a 5-minute conversation with Alex about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/assessment')}
              >
                <Mic className="mr-2 h-4 w-4" />
                Start Voice Assessment
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Speak naturally or type your responses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>Recent Assessments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  No assessments yet. Start your first assessment to see results here.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Assessments</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reports</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        {(!profile?.business_name || !profile?.industry) && (
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-accent">Complete Your Profile</CardTitle>
              <CardDescription>
                Help us provide better recommendations by completing your business profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>How Clarity Works</CardTitle>
            <CardDescription>
              New to Clarity? Here's how to get the most out of your AI assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Start Assessment</h4>
                  <p className="text-xs text-muted-foreground">
                    Answer questions about your business processes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-sm">AI Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Our AI identifies opportunities for automation
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Get Report</h4>
                  <p className="text-xs text-muted-foreground">
                    Receive personalized recommendations and next steps
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}