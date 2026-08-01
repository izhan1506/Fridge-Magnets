import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Eye, EyeOff, AlertCircle, CheckCircle, Info, ChevronRight, Menu, X } from "lucide-react";

export function DesignSystem() {
  const [showPassword, setShowPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    foundations: true,
    components: true,
  });
  const [activeSection, setActiveSection] = useState("overview");

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const navItems = [
    { id: "overview", label: "Overview", group: null },
    { id: "foundations", label: "Foundations", group: "foundations" },
    { id: "colors", label: "Colors", group: "foundations", parent: true },
    { id: "typography", label: "Typography", group: "foundations", parent: true },
    { id: "spacing", label: "Spacing & Sizing", group: "foundations", parent: true },
    { id: "components", label: "Components", group: "components" },
    { id: "buttons", label: "Buttons", group: "components", parent: true },
    { id: "forms", label: "Form Elements", group: "components", parent: true },
    { id: "cards", label: "Cards", group: "components", parent: true },
    { id: "badges", label: "Badges", group: "components", parent: true },
    { id: "alerts", label: "Alerts", group: "components", parent: true },
    { id: "tokens", label: "Design Tokens", group: null },
  ];

  const colors = [
    { name: "Primary", value: "#f46100", desc: "Main brand color" },
    { name: "Secondary", value: "#ff6b4a", desc: "Secondary accent" },
    { name: "Tertiary", value: "#4ddba0", desc: "Success/positive" },
    { name: "Destructive", value: "#ff5449", desc: "Error/danger" },
    { name: "Muted", value: "#2a2a2a", desc: "Disabled/inactive" },
    { name: "Background", value: "#171717", desc: "Base background" },
    { name: "Card", value: "#232323", desc: "Card background" },
  ];

  const magnetColors = [
    { name: "Coral", value: "#f0997b" },
    { name: "Pink", value: "#ed93b1" },
    { name: "Blue", value: "#85b7eb" },
    { name: "Amber", value: "#ef9f27" },
    { name: "Teal", value: "#5dcaa5" },
    { name: "Purple", value: "#afa9ec" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="font-fridge text-4xl text-primary">Fridge Magnets Design System</h1>
              <p className="mt-3 text-base text-muted-foreground">
                Complete living documentation of design tokens, components, and patterns used across Fridge Magnets.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Browse by category:</p>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li>• <span className="text-foreground">Foundations</span> — Colors, typography, spacing</li>
                    <li>• <span className="text-foreground">Components</span> — Interactive elements and layouts</li>
                    <li>• <span className="text-foreground">Design Tokens</span> — CSS variables reference</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "colors":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">Colors</h1>
              <p className="mt-2 text-muted-foreground">Core color palette for the entire application</p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Primary Colors</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                {colors.map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div
                      className="h-24 rounded-lg border border-border transition-transform hover:scale-105"
                      style={{ backgroundColor: color.value }}
                    />
                    <div>
                      <p className="text-sm font-medium">{color.name}</p>
                      <p className="text-xs text-muted-foreground">{color.value}</p>
                      <p className="text-xs text-muted-foreground">{color.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Magnet Accent Colors</h2>
              <p className="mb-4 text-sm text-muted-foreground">Used for magnet tiles and decorative elements</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
                {magnetColors.map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div
                      className="h-20 rounded-lg border border-border transition-transform hover:scale-105"
                      style={{ backgroundColor: color.value }}
                    />
                    <div>
                      <p className="text-sm font-medium">{color.name}</p>
                      <p className="text-xs text-muted-foreground">{color.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "typography":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">Typography</h1>
              <p className="mt-2 text-muted-foreground">Font scales and text styles</p>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl">Heading 1</h1>
                <p className="text-xs text-muted-foreground">font-fridge, 28px, medium weight</p>
              </div>
              <Separator />
              <div>
                <h2 className="text-2xl">Heading 2</h2>
                <p className="text-xs text-muted-foreground">font-fridge, 24px, medium weight</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl">Heading 3</h3>
                <p className="text-xs text-muted-foreground">font-fridge, 20px, medium weight</p>
              </div>
              <Separator />
              <div>
                <p className="text-base">Body text (16px, regular weight)</p>
                <p className="text-xs text-muted-foreground">Used for paragraphs and descriptions</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm">Small text (14px, regular weight)</p>
                <p className="text-xs text-muted-foreground">Used for secondary information</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs">Extra small text (12px, regular weight)</p>
                <p className="text-xs text-muted-foreground">Used for captions and helper text</p>
              </div>
            </div>
          </div>
        );

      case "spacing":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">Spacing & Sizing</h1>
              <p className="mt-2 text-muted-foreground">Consistent spacing scale and sizing units</p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Spacing Scale</h2>
              <div className="space-y-4">
                {[
                  { label: "0.25rem (1px)", value: "1px" },
                  { label: "0.5rem (2px)", value: "2px" },
                  { label: "1rem (4px)", value: "4px" },
                  { label: "1.5rem (6px)", value: "6px" },
                  { label: "2rem (8px)", value: "8px" },
                  { label: "2.5rem (10px)", value: "10px" },
                  { label: "3rem (12px)", value: "12px" },
                  { label: "4rem (16px)", value: "16px" },
                ].map((space) => (
                  <div key={space.label} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-muted-foreground">{space.label}</span>
                    <div className="h-1 bg-primary" style={{ width: space.value }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "buttons":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">Buttons</h1>
              <p className="mt-2 text-muted-foreground">Interactive button styles and states</p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Variants</h2>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Sizes</h2>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">States</h2>
              <div className="flex flex-wrap gap-3">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">All Variants Disabled</h2>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Primary</Button>
                <Button variant="secondary" disabled>
                  Secondary
                </Button>
                <Button variant="outline" disabled>
                  Outline
                </Button>
                <Button variant="ghost" disabled>
                  Ghost
                </Button>
                <Button variant="destructive" disabled>
                  Destructive
                </Button>
              </div>
            </div>
          </div>
        );

      case "forms":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">Form Elements</h1>
              <p className="mt-2 text-muted-foreground">Input fields and form controls</p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Text Inputs</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-input">Default Text Input</Label>
                  <Input id="text-input" placeholder="Enter some text..." />
                </div>
                <div>
                  <Label htmlFor="password-input">Password Input</Label>
                  <div className="relative">
                    <Input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password..."
                      className="pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="disabled-input">Disabled Input</Label>
                  <Input id="disabled-input" placeholder="Disabled input..." disabled />
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Checkboxes</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox id="cb1" />
                  <Label htmlFor="cb1">Unchecked</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="cb2" defaultChecked />
                  <Label htmlFor="cb2">Checked</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="cb3" disabled />
                  <Label htmlFor="cb3">Disabled</Label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Radio Buttons</h2>
              <RadioGroup defaultValue="option1">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="option1" id="radio1" />
                  <Label htmlFor="radio1">Option 1</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="option2" id="radio2" />
                  <Label htmlFor="radio2">Option 2</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="option3" id="radio3" disabled />
                  <Label htmlFor="radio3">Option 3 (disabled)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Switches</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch id="switch1" />
                  <Label htmlFor="switch1">Toggle switch</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="switch2" defaultChecked />
                  <Label htmlFor="switch2">Enabled by default</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="switch3" disabled />
                  <Label htmlFor="switch3">Disabled</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case "cards":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">Cards</h1>
              <p className="mt-2 text-muted-foreground">Container components for content</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Standard Card</CardTitle>
                  <CardDescription>With title and description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">This is the card content area with some text.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Card with Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Badge</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "badges":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">Badges</h1>
              <p className="mt-2 text-muted-foreground">Small label components</p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Variants</h2>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>
          </div>
        );

      case "alerts":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">Alerts</h1>
              <p className="mt-2 text-muted-foreground">Alert and notification styles</p>
            </div>

            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>Informational alert with helpful information.</AlertDescription>
              </Alert>

              <Alert>
                <CheckCircle className="h-4 w-4 text-tertiary" />
                <AlertDescription>Success alert — operation completed successfully.</AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription>Error alert — something went wrong. Please try again.</AlertDescription>
              </Alert>
            </div>
          </div>
        );

      case "tokens":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">Design Tokens</h1>
              <p className="mt-2 text-muted-foreground">CSS variables and theme configuration</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Color Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 font-mono text-xs lg:grid-cols-2">
                  <div className="space-y-2 text-muted-foreground">
                    <p><span className="text-primary">--primary:</span> #f46100</p>
                    <p><span className="text-secondary">--secondary:</span> #ff6b4a</p>
                    <p><span className="text-tertiary">--tertiary:</span> #4ddba0</p>
                    <p>--destructive: #ff5449</p>
                    <p>--muted: #2a2a2a</p>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <p>--background: #171717</p>
                    <p>--foreground: #f5f5f0</p>
                    <p>--card: #232323</p>
                    <p>--border: rgba(255, 255, 255, 0.14)</p>
                    <p>--radius: 0.625rem</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } border-r border-border bg-card transition-all duration-200 overflow-hidden`}
      >
        <div className="p-4 space-y-6">
          <div className="font-fridge text-xl text-primary">Fridge</div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <div key={item.id}>
                {item.group && !item.parent ? (
                  <button
                    onClick={() => toggleGroup(item.group)}
                    className="w-full px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted rounded transition"
                  >
                    {item.label}
                  </button>
                ) : item.parent ? (
                  expandedGroups[item.group] && (
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full pl-6 pr-3 py-2 text-left text-sm transition ${
                        activeSection === item.id
                          ? "text-primary font-medium bg-primary/10"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full px-3 py-2 text-left text-sm transition ${
                      activeSection === item.id
                        ? "text-primary font-medium bg-primary/10"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-sm text-muted-foreground">Design System</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">{renderSection()}</div>
        </div>
      </div>
    </div>
  );
}
