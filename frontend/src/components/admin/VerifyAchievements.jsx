import { useState } from 'react';
import { CheckCircle, X, AlertCircle, Clock3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';

export function VerifyAchievements() {
  const { achievements, verifyAchievement, currentUser } = useApp();
  const [filter, setFilter] = useState('pending');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    return achievement.status === filter;
  }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const handleApprove = async id => {
    if (currentUser) {
      const success = await verifyAchievement(id, 'approved', currentUser.name);
      if (success) {
        setIsReviewDialogOpen(false);
        setSelectedAchievement(null);
      }
    }
  };

  const handleReject = async id => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (currentUser) {
      const success = await verifyAchievement(id, 'rejected', currentUser.name, rejectionReason);
      if (success) {
        setIsRejectDialogOpen(false);
        setIsReviewDialogOpen(false);
        setRejectionReason('');
        setSelectedAchievement(null);
      }
    }
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
        return 'Accepted by Admin';
      case 'pending':
        return 'Waiting for Admin Review';
      case 'rejected':
        return 'Rejected by Admin';
      default:
        return status;
    }
  };

  const getEvidenceName = achievement => achievement.evidenceName || achievement.evidence || 'Attached file';
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

  const openReviewDialog = achievement => {
    setSelectedAchievement(achievement);
    setRejectionReason('');
    setIsRejectDialogOpen(false);
    setIsReviewDialogOpen(true);
  };

  const closeReviewDialog = () => {
    setIsReviewDialogOpen(false);
    setIsRejectDialogOpen(false);
    setRejectionReason('');
    setSelectedAchievement(null);
  };

  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Achievements</h3>
          <p className="text-gray-600 mb-4">Every student-submitted achievement appears here for admin review. Open a submission, check its details and evidence, then verify it.</p>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-center gap-2 text-yellow-800 font-semibold">
                <Clock3 className="h-4 w-4" />
                Waiting
              </div>
              <p className="mt-1 text-sm text-yellow-700">New submissions stay here until an admin takes action.</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle className="h-4 w-4" />
                Accept
              </div>
              <p className="mt-1 text-sm text-green-700">Marks the achievement as accepted and updates the student result.</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-800 font-semibold">
                <X className="h-4 w-4" />
                Reject
              </div>
              <p className="mt-1 text-sm text-red-700">Marks it as rejected and shows the reason to the student.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')} size="sm" className={filter === 'pending' ? 'bg-[#4361ee] hover:bg-[#3451d4]' : ''}>
              Waiting ({achievements.filter(a => a.status === 'pending').length})
            </Button>
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} size="sm" className={filter === 'all' ? 'bg-[#4361ee] hover:bg-[#3451d4]' : ''}>
              All ({achievements.length})
            </Button>
            <Button variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')} size="sm" className={filter === 'approved' ? 'bg-[#4361ee] hover:bg-[#3451d4]' : ''}>
              Accepted ({achievements.filter(a => a.status === 'approved').length})
            </Button>
            <Button variant={filter === 'rejected' ? 'default' : 'outline'} onClick={() => setFilter('rejected')} size="sm" className={filter === 'rejected' ? 'bg-[#4361ee] hover:bg-[#3451d4]' : ''}>
              Rejected ({achievements.filter(a => a.status === 'rejected').length})
            </Button>
          </div>
        </div>

        {filteredAchievements.length === 0 ? <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center">
                {filter === 'pending' ? 'No student achievements are waiting for admin review' : `No ${filter} achievements found`}
              </p>
            </CardContent>
          </Card> : <div className="grid gap-4">
            {filteredAchievements.map(achievement => <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle className="text-xl">{achievement.title}</CardTitle>
                        <Badge className={getStatusColor(achievement.status)}>
                          {getStatusLabel(achievement.status)}
                        </Badge>
                      </div>
                      <CardDescription>
                        <strong>Student:</strong> {achievement.studentName} | <strong>Category:</strong> {achievement.category} | <strong>Date:</strong> {new Date(achievement.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Description:</h4>
                      <p className="text-gray-700">{achievement.description}</p>
                    </div>

                    {(achievement.evidenceUrl || achievement.evidence_url || achievement.evidence) && <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Evidence:</h4>
                        {getEvidenceUrl(achievement) ? <a href={getEvidenceUrl(achievement)} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4">
                            Open {getEvidenceName(achievement)}
                          </a> : <p className="text-sm text-gray-600">{achievement.evidence}</p>}
                      </div>}

                    {achievement.status === 'pending' && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                        This achievement is waiting for admin review and verification.
                      </div>}

                    {achievement.status === 'rejected' && achievement.rejectionReason && <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900 text-sm">Rejection Reason:</p>
                          <p className="text-red-700 text-sm">{achievement.rejectionReason}</p>
                        </div>
                      </div>}

                    {achievement.status === 'approved' && achievement.verifiedBy && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                        Accepted by {achievement.verifiedBy} on {new Date(achievement.verifiedAt || '').toLocaleDateString()}
                      </div>}

                    <div className="text-sm text-gray-500">
                      Submitted: {new Date(achievement.submittedAt).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
                {achievement.status === 'pending' && <CardFooter className="border-t pt-4">
                    <Button onClick={() => openReviewDialog(achievement)} className="w-full bg-[#4361ee] hover:bg-[#3451d4] gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Review And Verify
                    </Button>
                  </CardFooter>}
              </Card>)}
          </div>}
      </div>

      <Dialog open={isReviewDialogOpen} onOpenChange={open => {
      if (!open) {
        closeReviewDialog();
      } else {
        setIsReviewDialogOpen(true);
      }
    }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Achievement</DialogTitle>
          </DialogHeader>

          {selectedAchievement && <div className="space-y-5">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">{selectedAchievement.title}</h4>
                  <Badge className={getStatusColor(selectedAchievement.status)}>
                    {getStatusLabel(selectedAchievement.status)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Student:</strong> {selectedAchievement.studentName}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <strong>Category:</strong> {selectedAchievement.category}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <strong>Date:</strong> {new Date(selectedAchievement.date).toLocaleDateString()}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <strong>Submitted:</strong> {new Date(selectedAchievement.submittedAt).toLocaleString()}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                <p className="text-sm leading-6 text-gray-700">{selectedAchievement.description}</p>
              </div>

              {(selectedAchievement.evidenceUrl || selectedAchievement.evidence_url || selectedAchievement.evidence) && <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Evidence</h5>
                  {getEvidenceUrl(selectedAchievement) ? <a href={getEvidenceUrl(selectedAchievement)} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4">
                      Open {getEvidenceName(selectedAchievement)}
                    </a> : <p className="text-sm text-gray-600">{selectedAchievement.evidence}</p>}
                </div>}

              {!isRejectDialogOpen ? <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => handleApprove(selectedAchievement.id)} className="flex-1 bg-green-600 hover:bg-green-700 gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Verify And Accept
                  </Button>
                  <Button variant="destructive" onClick={() => setIsRejectDialogOpen(true)} className="flex-1 gap-2">
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button variant="outline" onClick={closeReviewDialog} className="flex-1">
                    Close
                  </Button>
                </div> : <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">
                    Please provide a reason for rejecting <strong>"{selectedAchievement.title}"</strong>
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Reason for Rejection *</Label>
                    <Textarea id="rejectionReason" rows={4} placeholder="Explain why this achievement is not accepted..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="destructive" onClick={() => handleReject(selectedAchievement.id)} className="flex-1">
                      Confirm Rejection
                    </Button>
                    <Button variant="outline" onClick={() => {
                  setIsRejectDialogOpen(false);
                  setRejectionReason('');
                }} className="flex-1">
                      Back To Review
                    </Button>
                  </div>
                </div>}
            </div>}
        </DialogContent>
      </Dialog>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Admin Review Flow</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Each student achievement stays in the waiting list until an admin opens it and reviews the details</li>
          <li>After reviewing the submission and evidence, the admin can verify it as accepted or rejected</li>
          <li>Accepting an achievement updates the student result as accepted</li>
          <li>Rejecting an achievement updates the student result as rejected with a reason</li>
        </ul>
      </div>
    </div>;
}
