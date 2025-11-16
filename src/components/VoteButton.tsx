import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoteLink, useLinkVotes, useHasVoted, useGetVoteType } from "@/hooks/useLinkVotes";

interface VoteButtonProps {
  linkId: string;
  size?: "sm" | "md" | "lg";
}

const VoteButton = ({ linkId, size = "md" }: VoteButtonProps) => {
  const { data: votes } = useLinkVotes(linkId);
  const voteMutation = useVoteLink();
  const hasVoted = useHasVoted(linkId);
  const voteType = useGetVoteType(linkId);

  const upvotes = votes?.filter((v) => v.vote_type === "upvote").length || 0;
  const downvotes = votes?.filter((v) => v.vote_type === "downvote").length || 0;

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleVote = (newVoteType: "upvote" | "downvote") => {
    // Allow changing votes (downvote to upvote or vice versa)
    voteMutation.mutate({ linkId, voteType: newVoteType });
  };

  return (
    <div className="flex items-center gap-2" data-vote-button onClick={(e) => e.stopPropagation()}>
      <Button
        variant={hasVoted && voteType === "upvote" ? "default" : "outline"}
        size="icon"
        className={sizeClasses[size]}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote("upvote");
        }}
        disabled={voteMutation.isPending || (hasVoted && voteType === "upvote")}
        title={hasVoted && voteType === "upvote" ? "You've already upvoted" : "Upvote"}
      >
        <ThumbsUp className={iconSizes[size]} />
      </Button>
      <span className="text-sm font-medium min-w-[2ch] text-center">{upvotes}</span>

      <Button
        variant={hasVoted && voteType === "downvote" ? "destructive" : "outline"}
        size="icon"
        className={sizeClasses[size]}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote("downvote");
        }}
        disabled={voteMutation.isPending || (hasVoted && voteType === "downvote")}
        title={hasVoted && voteType === "downvote" ? "You've already downvoted" : "Downvote"}
      >
        <ThumbsDown className={iconSizes[size]} />
      </Button>
      <span className="text-sm font-medium min-w-[2ch] text-center">{downvotes}</span>
    </div>
  );
};

export default VoteButton;

