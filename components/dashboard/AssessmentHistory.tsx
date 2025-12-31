import { Calendar } from "lucide-react";

interface AssessmentHistoryProps {
  userStatsData: any;
}

export function AssessmentHistory({ userStatsData }: AssessmentHistoryProps) {
  if (
    !userStatsData?.assessmentHistory ||
    userStatsData.assessmentHistory.length <= 1
  ) {
    return null;
  }

  return (
    <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
          <Calendar className="h-6 w-6 stroke-3" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-700">
          Recent Progress
        </h3>
      </div>

      <div className="space-y-3">
        {userStatsData.assessmentHistory
          .slice()
          .reverse()
          .slice(0, 5)
          .map((assessment: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-slate-200 font-black text-slate-400 text-sm">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-bold text-slate-700">
                    {new Date(assessment.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Assessment
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xl font-black text-slate-700">
                  {assessment.promptScore}
                </div>
                {idx < userStatsData.assessmentHistory.length - 1 && (
                  <div
                    className={`px-2 py-1 rounded-lg text-xs font-black ${
                      assessment.promptScore >
                      userStatsData.assessmentHistory[
                        userStatsData.assessmentHistory.length - idx - 2
                      ].promptScore
                        ? "bg-green-100 text-green-600"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {assessment.promptScore >
                    userStatsData.assessmentHistory[
                      userStatsData.assessmentHistory.length - idx - 2
                    ].promptScore
                      ? `+${assessment.promptScore - userStatsData.assessmentHistory[userStatsData.assessmentHistory.length - idx - 2].promptScore}`
                      : `${assessment.promptScore - userStatsData.assessmentHistory[userStatsData.assessmentHistory.length - idx - 2].promptScore}`}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
