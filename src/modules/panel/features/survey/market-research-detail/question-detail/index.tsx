import { Dialog, DialogTrigger } from "@/core/components/ui/dialog";
import type { SurveyQuestion } from "@/core/types/research.type";
import QuestionModalBody from "./QuestionModalBody";

const QuestionDetailModal = ({
  question,
  index,
}: {
  question: SurveyQuestion;
  index: number;
}) => {
  return (
    <Dialog key={question.text}>
      <DialogTrigger asChild>
        <button className="bg-card group hover:bg-muted flex cursor-pointer justify-between gap-2 overflow-hidden rounded-md border p-4 text-left font-medium shadow-md md:items-center md:gap-4 md:p-5">
          <div className="bg-muted flex aspect-square size-7 items-center justify-center rounded-md border md:size-10">
            {index + 1}
          </div>
          <div className="flex w-full flex-col items-start justify-center gap-2 lg:flex-row lg:items-center lg:justify-between">
            <h4 className="text-base font-medium md:text-lg">
              {question.text}
            </h4>
            <div className="flex items-center">
              {/* <div className="space-x-2">
                <span className="font-medium">20 (18%)</span>
                <span className="text-muted-foreground font-medium text-base">Acne</span>
              </div> */}
            </div>
          </div>
        </button>
      </DialogTrigger>

      <QuestionModalBody question={question} index={index} />
    </Dialog>
  );
};

export default QuestionDetailModal;
