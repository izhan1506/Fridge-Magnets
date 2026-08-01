import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function DesignSystem() {
  const [showPassword, setShowPassword] = useState(false);

  const colors = [
    { name: "Primary", value: "#f46100", css: "bg-primary", text: "text-primary" },
    { name: "Secondary", value: "#ff6b4a", css: "bg-secondary", text: "text-secondary" },
    { name: "Tertiary", value: "#4ddba0", css: "bg-tertiary", text: "text-tertiary" },
    { name: "Destructive", value: "#ff5449", css: "bg-destructive" },
    { name: "Muted", value: "#2a2a2a", css: "bg-muted" },
  ];

  const magnetColors = [
    { name: "Coral", value: "#f0997b" },
    { name: "Pink", value: "#ed93b1" },
    { name: "Blue", value: "#85b7eb" },
    { name: "Amber", value: "#ef9f27" },
    { name: "Teal", value: "#5dcaa5" },
    { name: "Purple", value: "#afa9ec" },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-fridge text-4xl text-primary">Fridge Magnets Design System</h1>
          <p className="mt-2 text-muted-foreground">
            Complete guide to colors, components, and patterns
          </p>
        </div>

        {/* Color Palette Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Color Palette</h2>

          <div className="mb-8">
            <h3 className="mb-4 text-lg font-medium">Primary Colors</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {colors.map((color) => (
                <div key={color.name} className="flex flex-col gap-2">
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

          <div>
            <h3 className="mb-4 text-lg font-medium">Magnet Accent Colors</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
              {magnetColors.map((color) => (
                <div key={color.name} className="flex flex-col gap-2">
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
        </section>

        <Separator className="mb-12" />

        {/* Typography Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Typography</h2>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl">Heading 1 (h1)</h1>
              <p className="text-xs text-muted-foreground">font-fridge, 28px, medium weight</p>
            </div>

            <div>
              <h2 className="text-2xl">Heading 2 (h2)</h2>
              <p className="text-xs text-muted-foreground">font-fridge, 24px, medium weight</p>
            </div>

            <div>
              <h3 className="text-xl">Heading 3 (h3)</h3>
              <p className="text-xs text-muted-foreground">font-fridge, 20px, medium weight</p>
            </div>

            <div>
              <p className="text-base">Body text (16px, regular weight)</p>
              <p className="text-xs text-muted-foreground">Used for paragraphs and descriptions</p>
            </div>

            <div>
              <p className="text-sm">Small text (14px, regular weight)</p>
              <p className="text-xs text-muted-foreground">Used for secondary information</p>
            </div>

            <div>
              <p className="text-xs">Extra small text (12px, regular weight)</p>
              <p className="text-xs text-muted-foreground">Used for captions and helper text</p>
            </div>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Buttons</h2>

          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Default (Primary)</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Sizes</h3>
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button className="w-full sm:w-auto">Full Width</Button>
              </div>
            </div>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Forms Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Form Elements</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Text Input</h3>
              <Input placeholder="Enter some text..." />
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Password Input</h3>
              <div className="relative">
                <Input
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
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Disabled Input</h3>
              <Input placeholder="Disabled input..." disabled />
            </div>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Cards</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This is the card content area with some text.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge>Badge</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Badges Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Badges</h2>

          <div className="space-y-4">
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Default</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge>Tag</Badge>
                <Badge>Badge</Badge>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Spacing Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Spacing Scale</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm font-medium text-muted-foreground">0.25rem</span>
              <div className="h-1 w-1 bg-primary" />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm font-medium text-muted-foreground">0.5rem</span>
              <div className="h-1 w-2 bg-primary" />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm font-medium text-muted-foreground">1rem</span>
              <div className="h-1 w-4 bg-primary" />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm font-medium text-muted-foreground">1.5rem</span>
              <div className="h-1 w-6 bg-primary" />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm font-medium text-muted-foreground">2rem</span>
              <div className="h-1 w-8 bg-primary" />
            </div>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Toggles Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Toggles</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Toggle>Toggle</Toggle>
              <p className="text-sm text-muted-foreground">Default toggle state</p>
            </div>
            <div className="flex items-center gap-3">
              <Toggle pressed>Toggle</Toggle>
              <p className="text-sm text-muted-foreground">Pressed toggle state</p>
            </div>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Usage Notes */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold">Design Tokens (CSS Variables)</h2>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theme Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs text-muted-foreground">
                <p>
                  <span className="text-primary">Primary:</span> --primary (#f46100)
                </p>
                <p>
                  <span className="text-secondary">Secondary:</span> --secondary (#ff6b4a)
                </p>
                <p>
                  <span className="text-tertiary">Tertiary:</span> --tertiary (#4ddba0)
                </p>
                <p>Radius: --radius (0.625rem)</p>
                <p>Background: --background (#171717)</p>
                <p>Foreground: --foreground (#f5f5f0)</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
