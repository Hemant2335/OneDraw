import * as React from "react";
import {AlertDialog} from "radix-ui";

export const CollabWarningPopup: React.FC<{
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  isAutoTriggered: boolean;
  handleClick: () => void;
}> = ({ handleClick, isAutoTriggered, open, setOpen }) => {
  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg z-50 w-full max-w-md">
          <AlertDialog.Title className="text-lg font-bold">
            This is not your Canvas
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 mb-4">
            {isAutoTriggered
              ? "You will be redirected to home page"
              : "You might want to collaborate on this updating the state to Collaborate"}
          </AlertDialog.Description>
          <div className="flex justify-end space-x-2">
            <AlertDialog.Action
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => {
                if (isAutoTriggered) {
                  window.location.href = "/";
                } else {
                  handleClick();
                }
              }}
            >
              OK
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
