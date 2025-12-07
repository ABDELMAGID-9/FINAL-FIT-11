import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { TopBar } from './shared/TopBar';

interface DetailsPageProps {
  onLogout: () => void;
}

export function DetailsPage({ onLogout }: DetailsPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in a real app, this would be fetched based on the id
  const item = {
    id: id || '1',
    name: 'Project Alpha',
    description: 'A comprehensive project management solution designed to streamline team collaboration and improve productivity across multiple departments.',
    status: 'active' as const,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    author: 'John Doe',
    tags: ['project-management', 'collaboration', 'productivity'],
    details: {
      version: '1.2.0',
      environment: 'Production',
      dependencies: 15,
      lastDeployment: '2024-01-18'
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar onLogout={onLogout} />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1>{item.name}</h1>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/form?edit=${item.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Version</p>
                      <p>{item.details.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Environment</p>
                      <p>{item.details.environment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dependencies</p>
                      <p>{item.details.dependencies}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Deployment</p>
                      <p>{item.details.lastDeployment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Author</p>
                      <p>{item.author}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p>{item.createdAt}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Updated</p>
                      <p>{item.updatedAt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}