import { useEffect, useState } from "react";
import { getMobileSupabaseClient } from "./supabase";

export interface PendingInvite {
  id: string;
  familyId: string;
  email: string;
  displayName: string;
  role: "parent" | "child";
}

export interface MembershipState {
  isLoading: boolean;
  hasMember: boolean;
  invite: PendingInvite | null;
}

interface FamilyMemberRow {
  id: string;
}

interface InviteRow {
  id: string;
  family_id: string;
  email: string;
  display_name: string;
  role: "parent" | "child";
}

export function useMembershipState(enabled: boolean): MembershipState & {
  refresh: () => Promise<void>;
  acceptInvite: () => Promise<void>;
  createFamily: (input: { familyName: string; displayName: string }) => Promise<void>;
} {
  const [isLoading, setIsLoading] = useState(enabled);
  const [hasMember, setHasMember] = useState(false);
  const [invite, setInvite] = useState<PendingInvite | null>(null);

  async function load() {
    if (!enabled) {
      setIsLoading(false);
      setHasMember(false);
      setInvite(null);
      return;
    }

    setIsLoading(true);
    const client = getMobileSupabaseClient();

    if (!client) {
      setHasMember(false);
      setInvite(null);
      setIsLoading(false);
      return;
    }

    const sessionResult = await client.auth.getSession();
    const session = sessionResult.data.session;
    const user = session?.user;
    const email = user?.email?.trim().toLowerCase();

    if (!user?.id || !email) {
      setHasMember(false);
      setInvite(null);
      setIsLoading(false);
      return;
    }

    const memberResult = await client
      .from("family_members")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle<FamilyMemberRow>();

    if (memberResult.error) {
      if (__DEV__) {
        console.info(`[membership] member-load-error=${JSON.stringify(memberResult.error)}`);
      }
      throw memberResult.error;
    }

    if (memberResult.data) {
      setHasMember(true);
      setInvite(null);
      setIsLoading(false);
      return;
    }

    const inviteResult = await client
      .from("family_member_invites")
      .select("id, family_id, email, display_name, role")
      .eq("email", email)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle<InviteRow>();

    if (inviteResult.error) {
      if (__DEV__) {
        console.info(`[membership] invite-load-error=${JSON.stringify(inviteResult.error)}`);
      }
      throw inviteResult.error;
    }

    setHasMember(false);
    setInvite(
      inviteResult.data
        ? {
            id: inviteResult.data.id,
            familyId: inviteResult.data.family_id,
            email: inviteResult.data.email,
            displayName: inviteResult.data.display_name,
            role: inviteResult.data.role
          }
        : null
    );
    setIsLoading(false);
  }

  async function acceptInvite() {
    const client = getMobileSupabaseClient();

    if (!client) {
      throw new Error("Supabase environment is not configured.");
    }

    const sessionResult = await client.auth.getSession();
    const session = sessionResult.data.session;
    const user = session?.user;

    if (!user?.id) {
      throw new Error("No active Supabase user session.");
    }

    if (!invite) {
      throw new Error("No pending invite found.");
    }

    const memberInsert = await client.from("family_members").insert({
      family_id: invite.familyId,
      user_id: user.id,
      display_name: invite.displayName,
      role: invite.role
    });

    if (memberInsert.error) {
      if (__DEV__) {
        console.info(`[membership] accept-invite-member-error=${JSON.stringify(memberInsert.error)}`);
      }
      throw memberInsert.error;
    }

    const inviteUpdate = await client
      .from("family_member_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    if (inviteUpdate.error) {
      if (__DEV__) {
        console.info(`[membership] accept-invite-update-error=${JSON.stringify(inviteUpdate.error)}`);
      }
      throw inviteUpdate.error;
    }

    await load();
  }

  async function createFamily(input: { familyName: string; displayName: string }) {
    const client = getMobileSupabaseClient();

    if (!client) {
      throw new Error("Supabase environment is not configured.");
    }

    const sessionResult = await client.auth.getSession();
    const session = sessionResult.data.session;
    const user = session?.user;

    if (!user?.id) {
      throw new Error("No active Supabase user session.");
    }

    const familyId = createUuid();

    const familyInsert = await client
      .from("families")
      .insert({
        id: familyId,
        name: input.familyName.trim(),
        created_by: user.id
      });

    if (familyInsert.error) {
      if (__DEV__) {
        console.info(`[membership] create-family-error=${JSON.stringify(familyInsert.error)}`);
      }
      throw familyInsert.error;
    }

    const memberInsert = await client.from("family_members").insert({
      family_id: familyId,
      user_id: user.id,
      display_name: input.displayName.trim(),
      role: "parent"
    });

    if (memberInsert.error) {
      if (__DEV__) {
        console.info(`[membership] create-family-member-error=${JSON.stringify(memberInsert.error)}`);
      }
      throw memberInsert.error;
    }

    await load();
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        await load();
      } catch (error) {
        if (__DEV__) {
          if (error instanceof Error) {
            console.info(`[membership] bootstrap-error=${error.message}`);
          } else if (typeof error === "object" && error !== null) {
            console.info(`[membership] bootstrap-error=${JSON.stringify(error)}`);
          } else {
            console.info(`[membership] bootstrap-error=${String(error)}`);
          }
        }
        if (active) {
          setHasMember(false);
          setInvite(null);
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [enabled]);

  return {
    isLoading,
    hasMember,
    invite,
    refresh: load,
    acceptInvite,
    createFamily
  };
}

function createUuid() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replaceAll(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
