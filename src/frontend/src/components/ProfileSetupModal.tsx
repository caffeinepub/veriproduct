import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface Props {
  open: boolean;
}

export default function ProfileSetupModal({ open }: Props) {
  const [name, setName] = useState("");
  const saveMutation = useSaveCallerUserProfile();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await saveMutation.mutateAsync({ name: name.trim() });
      toast.success("Welcome to VeriProduct!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        data-ocid="profile.setup.dialog"
        className="max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center text-center">
          <div className="w-14 h-14 rounded-full bg-teal/15 ring-2 ring-teal/30 flex items-center justify-center mb-2">
            <UserCheck className="w-7 h-7 text-teal" />
          </div>
          <DialogTitle className="text-xl">Welcome to VeriProduct</DialogTitle>
          <DialogDescription className="text-sm">
            You&apos;re almost set! Tell us your name so we can personalize your
            experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="profile-name">Your Name</Label>
          <Input
            id="profile-name"
            data-ocid="profile.setup.input"
            placeholder="e.g. Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            data-ocid="profile.setup.submit_button"
            className="w-full bg-teal text-white hover:bg-teal/80"
            onClick={handleSubmit}
            disabled={!name.trim() || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {saveMutation.isPending ? "Saving..." : "Get Started"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
