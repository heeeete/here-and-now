'use client';

import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui/dialog';
import { Button } from '@/src/shared/ui/button';
import { fetchReportById } from '@/src/entities/report/api/fetch-report-by-id';
import { postReaction } from '@/src/entities/report/api/post-reaction';
import { postReportIncident } from '@/src/entities/report/api/post-report-incident';
import { deleteReport } from '@/src/entities/report/api/delete-report';
import { Report } from '@/src/entities/report/model/types';
import { AuthPasswordModal } from './AuthPasswordModal';
import { EditReportModal } from './EditReportModal';
import { cn } from '@/src/shared/lib/utils';

interface ReportDetailModalProps {
  reportId: string | null;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

const REACTIONS_STORAGE_KEY = 'nowhere_user_reactions';

export const ReportDetailModal = ({
  reportId,
  onOpenChange,
  onRefresh,
}: ReportDetailModalProps) => {
  const [report, setReport] = useState<Report | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [userReaction, setUserReaction] = useState<'helpful' | 'ended' | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'edit' | 'delete' | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState('');

  // 반응 기록 로드
  useEffect(() => {
    if (!reportId) {
      setUserReaction(null);
      return;
    }
    const reactions = JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY) || '{}');
    setUserReaction(reactions[reportId] || null);
  }, [reportId]);

  const fetchDetail = useCallback(async () => {
    if (!reportId) return;
    const data = await fetchReportById(reportId);
    setReport(data);
  }, [reportId]);

  useEffect(() => {
    const init = async () => {
      await fetchDetail();
    };
    void init();
  }, [fetchDetail]);

  useEffect(() => {
    if (!report?.expires_at) return;

    const now = new Date().getTime();
    const expires = new Date(report.expires_at).getTime();
    const diff = expires - now;

    if (diff <= 0) {
      setTimeLeft('만료됨');
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}시간 ${mins}분 남음`);
    }
  }, [report?.expires_at]);

  const handleReaction = async (type: 'helpful' | 'ended') => {
    if (!reportId) return;

    // 로컬 중복 체크
    const reactions = JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY) || '{}');
    if (reactions[reportId]) {
      alert('이미 반응을 남기셨습니다!');
      return;
    }

    try {
      await postReaction(reportId, type);

      // 로컬 스토리지 저장
      reactions[reportId] = type;
      localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
      setUserReaction(type);

      void fetchDetail();
    } catch {
      alert('반응을 등록하지 못했습니다.');
    }
  };

  const handleReportIncident = async () => {
    if (!reportId) return;
    if (!confirm('이 제보를 신고하시겠습니까?')) return;

    try {
      await postReportIncident(reportId);
      alert('신고가 접수되었습니다.');
      onOpenChange(false);
    } catch {
      alert('신고 중 오류가 발생했습니다.');
    }
  };

  const handleAuthConfirm = async (password: string) => {
    if (!reportId) return;

    try {
      if (authMode === 'delete') {
        if (!confirm('정말로 이 제보를 삭제하시겠습니까?')) return;
        await deleteReport(reportId, password);
        alert('삭제되었습니다.');
        setIsAuthModalOpen(false);
        onOpenChange(false);
        onRefresh();
      } else if (authMode === 'edit') {
        const { postVerifyPassword } =
          await import('@/src/entities/report/api/post-verify-password');
        await postVerifyPassword(reportId, password);

        setVerifiedPassword(password);
        setIsAuthModalOpen(false);
        setIsEditModalOpen(true);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '비밀번호가 일치하지 않습니다.';
      alert(message);
    }
  };

  if (!reportId) return null;

  return (
    <>
      <Dialog open={!!reportId} onOpenChange={onOpenChange}>
        <DialogContent className="fixed top-auto right-4 bottom-4 left-auto w-[320px] translate-x-0 translate-y-0 overflow-hidden p-0 sm:max-w-[320px]">
          <div className="flex flex-col pt-5">
            <div className="p-5 pb-0">
              <DialogHeader className="gap-1.5">
                <div className="flex items-center justify-end">
                  <span className="text-[11px] font-semibold text-red-500">{timeLeft}</span>
                </div>
                <DialogTitle className="mt-1 text-base leading-snug font-bold break-keep">
                  {report?.comment}
                </DialogTitle>
                <p className="text-[10px] text-slate-400">
                  {report?.created_at && new Date(report.created_at).toLocaleTimeString()} 제보
                </p>
              </DialogHeader>
            </div>

            <div className="grid grid-cols-2 gap-2 p-5 pt-4">
              <Button
                variant={userReaction === 'helpful' ? 'default' : 'outline'}
                disabled={!!userReaction}
                className={cn(
                  'flex h-12 flex-col items-center justify-center gap-0 border-slate-100 bg-slate-50/50 transition-all',
                  userReaction === 'helpful'
                    ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-600'
                    : 'hover:border-blue-100 hover:bg-blue-50',
                )}
                onClick={() => handleReaction('helpful')}
              >
                <span
                  className={cn(
                    'text-[11px] font-bold',
                    userReaction === 'helpful' ? 'text-white' : 'text-slate-700',
                  )}
                >
                  도움됐어요
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    userReaction === 'helpful' ? 'text-blue-100' : 'text-blue-500',
                  )}
                >
                  {report?.helpful_count || 0}
                </span>
              </Button>
              <Button
                variant={userReaction === 'ended' ? 'default' : 'outline'}
                disabled={!!userReaction}
                className={cn(
                  'flex h-12 flex-col items-center justify-center gap-0 border-slate-100 bg-slate-50/50 transition-all',
                  userReaction === 'ended'
                    ? 'border-red-600 bg-red-600 text-white hover:bg-red-600'
                    : 'hover:border-red-100 hover:bg-red-50',
                )}
                onClick={() => handleReaction('ended')}
              >
                <span
                  className={cn(
                    'text-[11px] font-bold',
                    userReaction === 'ended' ? 'text-white' : 'text-slate-700',
                  )}
                >
                  끝났어요
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    userReaction === 'ended' ? 'text-red-100' : 'text-red-500',
                  )}
                >
                  {report?.ended_count || 0}
                </span>
              </Button>
            </div>

            <div className="flex flex-row items-stretch gap-0 border-t border-slate-100 bg-slate-50/30 p-0 sm:justify-start">
              <Button
                variant="ghost"
                className="h-11 flex-1 rounded-none text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-red-500"
                onClick={handleReportIncident}
              >
                신고
              </Button>
              <div className="w-px bg-slate-100" />
              <Button
                variant="ghost"
                className="h-11 flex-1 rounded-none text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                onClick={() => {
                  setAuthMode('edit');
                  setIsAuthModalOpen(true);
                }}
              >
                수정
              </Button>
              <div className="w-px bg-slate-100" />
              <Button
                variant="ghost"
                className="h-11 flex-1 rounded-none text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-red-600"
                onClick={() => {
                  setAuthMode('delete');
                  setIsAuthModalOpen(true);
                }}
              >
                삭제
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthPasswordModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onConfirm={handleAuthConfirm}
        title={authMode === 'edit' ? '제보 수정' : '제보 삭제'}
        description="비밀번호를 입력해주세요."
      />

      <EditReportModal
        report={report}
        isOpen={isEditModalOpen}
        password={verifiedPassword}
        onOpenChange={setIsEditModalOpen}
        onSuccess={() => {
          setIsEditModalOpen(false);
          void fetchDetail();
          onRefresh();
        }}
      />
    </>
  );
};
