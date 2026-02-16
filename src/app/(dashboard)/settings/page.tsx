import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/settings/profile-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";
import { ApiKeysTab } from "@/components/settings/api-keys-tab";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, preferences, and integrations."
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab
            user={{
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              role: user.role,
            }}
          />
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <PreferencesTab />
        </TabsContent>

        <TabsContent value="api-keys" className="mt-4">
          <ApiKeysTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
