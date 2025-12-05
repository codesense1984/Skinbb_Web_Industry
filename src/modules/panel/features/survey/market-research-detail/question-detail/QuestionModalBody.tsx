import { Button } from "@/core/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/ui/dialog";
import type { SurveyQuestion } from "@/core/types/research.type";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createContext, useState } from "react";
import OptionCharts from "./OptionCharts";
import OptionsToggle from "./OptionsToggle";

interface QuestionContext {
  question?: SurveyQuestion;
  activeToggle: string;
}
export const QuestionDetailContext = createContext<QuestionContext>({
  question: undefined,
  activeToggle: "",
});

const QuestionModalBody = ({
  question,
  index,
}: {
  question: SurveyQuestion;
  index: number;
}) => {
  const [currentOption, setCurrentOption] = useState(question.options[0]);
  return (
    <QuestionDetailContext.Provider
      value={{
        activeToggle: currentOption,
        question: question,
      }}
    >
      <DialogContent
        className="min-w-[calc(100vw-2rem)] overflow-hidden p-0"
        showCloseButton={false}
        aria-description={question.text}
      >
        <div className="max-h-[calc(100dvh-1rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 p-3 pb-0 md:p-5 md:px-5 md:pb-3">
              <div className="flex w-full justify-between gap-2 overflow-hidden rounded-md text-left md:items-center md:gap-4">
                <div className="bg-muted flex aspect-square size-7 items-center justify-center rounded-md border md:size-10">
                  {index + 1}
                </div>
                <div className="flex w-full flex-col items-start justify-center gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h4 className="text-base font-medium md:text-lg">
                      {question.text}
                    </h4>
                    <p className="text-base font-normal">
                      {question.description}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {/* <div className="space-x-2">
                      <span className="font-medium">20 (18%)</span>
                      <span className="text-muted-foreground text-base font-medium">
                        Acne
                      </span>
                    </div> */}
                  </div>
                </div>
                <DialogTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="size-6"
                    size={"icon"}
                    startIcon={<XMarkIcon />}
                  ></Button>
                </DialogTrigger>
              </div>
              {/* <div className="bg-muted flex aspect-square h-11 items-center justify-center rounded-md border">
              {index + 1}
            </div>
            <div>
              <h2 className="text-xl">{question.text}</h2>
              <span className="text-muted-foreground text-base font-normal">
                {question.description}
              </span>
            </div>
            <div className="ml-auto flex gap-2">
              <div className="space-x-2">
                <span className="font-bold">20 (18%)</span>
                <span className="text-muted-foreground text-base">Acne</span>
              </div>
              <DialogTrigger asChild>
                <Button
                  variant={"outlined"}
                  size={"icon"}
                  startIcon={<XMarkIcon />}
                ></Button>
              </DialogTrigger>
            </div> */}
            </DialogTitle>
          </DialogHeader>
          <hr />
          <div className="grid grid-cols-1 gap-4 p-3 md:grid-cols-10 md:gap-5 md:px-5 md:pt-3 md:pb-5">
            <div className="md:col-span-2">
              Options
              <div className="mt-2 flex flex-col gap-5">
                <OptionsToggle
                  value={currentOption}
                  options={["All", ...question.options]}
                  onValueChange={(data) => {
                    setCurrentOption(data);
                  }}
                />
              </div>
            </div>
            <div className="md:col-span-8">
              <OptionCharts />
            </div>
          </div>
        </div>
      </DialogContent>
    </QuestionDetailContext.Provider>
  );
};

export default QuestionModalBody;
