import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateVoteId, hasVoted as checkHasVoted, setVoted as setVotedCookie, getVoteType as getVoteTypeCookie, getClientInfo } from "@/lib/voteTracking";

export interface Vote {
  id: string;
  link_id: string;
  vote_type: "upvote" | "downvote";
  cookie_id: string;
  ip_address: string;
  voted_at: string;
}

export const useLinkVotes = (linkId: string) => {
  return useQuery({
    queryKey: ["link_votes", linkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("link_votes")
        .select("*")
        .eq("link_id", linkId);

      if (error) throw error;
      return data as Vote[];
    },
  });
};

export const useVoteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, voteType }: { linkId: string; voteType: "upvote" | "downvote" }) => {
      // Check if already voted
      if (checkHasVoted(linkId)) {
        const existingVoteType = getVoteTypeCookie(linkId);
        if (existingVoteType === voteType) {
          throw new Error("You have already voted on this link");
        }
        // Allow changing vote
      }

      const cookieId = generateVoteId(linkId).split("_")[0]; // Get base cookie ID
      const clientInfo = await getClientInfo();

      // IP address will be extracted server-side via Edge Function or trigger
      // For now, use placeholder - server should replace with real IP
      const ipAddress = "0.0.0.0";

      // Delete existing vote if changing
      if (checkHasVoted(linkId)) {
        const existingVoteType = getVoteTypeCookie(linkId);
        await supabase
          .from("link_votes")
          .delete()
          .eq("link_id", linkId)
          .eq("cookie_id", cookieId);
      }

      const { data, error } = await supabase
        .from("link_votes")
        .insert([{
          link_id: linkId,
          vote_type: voteType,
          cookie_id: cookieId,
          ip_address: ipAddress,
          user_agent: clientInfo.userAgent,
        }])
        .select()
        .single();

      if (error) throw error;

      // Set cookie to prevent duplicate votes
      setVotedCookie(linkId, voteType);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["link_votes", variables.linkId] });
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success(`Your ${variables.voteType === "upvote" ? "upvote" : "downvote"} has been recorded!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to vote");
    },
  });
};

export const useHasVoted = (linkId: string) => {
  return checkHasVoted(linkId);
};

export const useGetVoteType = (linkId: string) => {
  return getVoteTypeCookie(linkId);
};

