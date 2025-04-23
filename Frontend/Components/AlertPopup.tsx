import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/AlertDiag";
import React from "react";
import UrlCopyField from "@/Components/UrlCopyField";

export const AlertPopup: React.FC<{
  className: string;
  TriggerName: string;
  AlertTitle: string;
  AlertMessage: string;
  handleClick : ()=>void;
  url?: string;
}> = ({ className , handleClick , url , TriggerName , AlertMessage , AlertTitle }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger className={className}>{TriggerName}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{AlertTitle}</AlertDialogTitle>
          <AlertDialogDescription>
              {AlertMessage}
                {url && <UrlCopyField url={ url} />}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel >Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClick}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
