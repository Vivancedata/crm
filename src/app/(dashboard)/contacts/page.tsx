import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";

// Mock data - will be replaced with real data from Prisma
const contacts = [
  { id: 1, name: "Carlos Martinez", email: "carlos@martinez-construction.com", company: "Martinez Construction", industry: "Construction", status: "active" },
  { id: 2, name: "Sarah Johnson", email: "sarah@greenvalleyhvac.com", company: "Green Valley HVAC", industry: "HVAC", status: "active" },
  { id: 3, name: "Mike Chen", email: "mike@techstart.io", company: "TechStart Inc", industry: "Startup", status: "active" },
  { id: 4, name: "David Smith", email: "david@smithlogistics.com", company: "Smith Logistics", industry: "Logistics", status: "active" },
  { id: 5, name: "Jennifer Lee", email: "jennifer@precisionmfg.com", company: "Precision Manufacturing", industry: "Manufacturing", status: "active" },
];

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contacts and leads
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search contacts..."
            className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Company</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Industry</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b last:border-0 hover:bg-accent/50 cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {contact.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-medium">{contact.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{contact.email}</td>
                <td className="px-6 py-4">{contact.company}</td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{contact.industry}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="success">Active</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
