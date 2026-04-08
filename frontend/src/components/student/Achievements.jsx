import { Button } from '../ui/button';
import { Trash2, Trophy, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

export function Achievements() {
  const { achievements, deleteAchievement } = useApp();
  const getEvidenceUrl = achievement => {
    const url = achievement.evidenceUrl || achievement.evidence_url || '';
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    if (url.startsWith('/uploads/')) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  const getStatusColor = status => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = status => {
    switch (status) {
      case 'approved':
        return 'Accepted';
      case 'pending':
        return 'Waiting for Admin Review';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteAchievement(id);
    }
  };

  const getEvidenceName = achievement => achievement.evidenceName || achievement.evidence || 'Attached file';

  const sortedAchievements = [...achievements].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">My Achievements</h3>
          <p className="text-gray-600">View the admin decision for each submitted achievement</p>
        </div>

        {sortedAchievements.length === 0 ? <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Achievements Yet</h4>
            <p className="text-gray-500">Start by submitting your first achievement.</p>
          </div> : <div className="grid gap-4">
            {sortedAchievements.map(achievement => <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle className="text-xl">{achievement.title}</CardTitle>
                        <Badge className={getStatusColor(achievement.status)}>
                          {getStatusLabel(achievement.status)}
                        </Badge>
                        {achievement.points && achievement.status === 'approved' && <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            +{achievement.points} points
                          </Badge>}
                      </div>
                      <CardDescription>
                        <span className="font-semibold">{achievement.category}</span> | {new Date(achievement.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{achievement.description}</p>

                  {achievement.status === 'pending' && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-sm text-yellow-800">
                      Your achievement has been submitted and is waiting for admin verification.
                    </div>}

                  {achievement.status === 'rejected' && <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900 text-sm">Rejected by Admin:</p>
                        <p className="text-red-700 text-sm">{achievement.rejectionReason || 'This achievement was not accepted.'}</p>
                      </div>
                    </div>}

                  {achievement.status === 'approved' && achievement.verifiedBy && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                      Accepted by {achievement.verifiedBy} on {new Date(achievement.verifiedAt || '').toLocaleDateString()}
                    </div>}

                  {(achievement.evidenceUrl || achievement.evidence_url || achievement.evidence) && <div className="mt-3 text-sm text-gray-600">
                      <span className="font-semibold">Evidence:</span>{' '}
                      {getEvidenceUrl(achievement) ? <a href={getEvidenceUrl(achievement)} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4">
                          Open {getEvidenceName(achievement)}
                        </a> : achievement.evidence}
                    </div>}
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <div className="text-sm text-gray-500">
                    Submitted: {new Date(achievement.submittedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(achievement.id, achievement.title)} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>)}
          </div>}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Achievement Status Guide</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 border-green-200">Accepted</Badge>
            <span>Your achievement was verified and accepted by the admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Waiting for Admin Review</Badge>
            <span>Your achievement is still waiting for admin verification</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>
            <span>Your achievement was reviewed and not accepted by the admin</span>
          </div>
        </div>
      </div>
    </div>;
}
