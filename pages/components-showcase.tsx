import React, { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Badge, Avatar, Spinner, Modal } from '../components';
import { IconPlus, IconHeart, IconStar, IconUser, IconSettings, IconBell } from '@tabler/icons-react';

const ComponentsShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Modern Components Showcase
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            A collection of modern, accessible UI components built with Tailwind CSS
          </p>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Modern button variants with different styles and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" icon={<IconPlus className="w-4 h-4" />}>
                Primary Button
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button fullWidth>Full Width</Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" hover>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card with hover effects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                This is a default card with subtle hover animations and modern styling.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Learn More</Button>
            </CardFooter>
          </Card>

          <Card variant="elevated" hover>
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card with enhanced shadows</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                This card has enhanced shadows and a more prominent appearance.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">Get Started</Button>
            </CardFooter>
          </Card>

          <Card variant="glass" hover>
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Glassmorphism effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                This card uses glassmorphism with backdrop blur effects.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">Explore</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Form Elements Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Modern input fields with validation states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Default Input"
                placeholder="Enter your text here"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Input with Icon"
                placeholder="Search..."
                leftIcon={<IconUser className="w-4 h-4" />}
              />
              <Input
                label="Password Input"
                type="password"
                placeholder="Enter your password"
              />
              <Input
                label="Input with Error"
                placeholder="This input has an error"
                error="This field is required"
              />
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status indicators and labels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Badge icon={<IconHeart className="w-3 h-3" />}>With Icon</Badge>
              <Badge icon={<IconStar className="w-3 h-3" />} iconPosition="right">
                Icon Right
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Avatars Section */}
        <Card>
          <CardHeader>
            <CardTitle>Avatars</CardTitle>
            <CardDescription>User profile pictures with status indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <Avatar size="xs" fallback="John Doe" />
              <Avatar size="sm" fallback="Jane Smith" />
              <Avatar size="md" fallback="Bob Johnson" />
              <Avatar size="lg" fallback="Alice Brown" />
              <Avatar size="xl" fallback="Charlie Wilson" />
              <Avatar size="2xl" fallback="Diana Davis" />
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-6">
              <Avatar size="md" fallback="Online User" status="online" />
              <Avatar size="md" fallback="Offline User" status="offline" />
              <Avatar size="md" fallback="Away User" status="away" />
              <Avatar size="md" fallback="Busy User" status="busy" />
            </div>
          </CardContent>
        </Card>

        {/* Loading States Section */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Different loading indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-8">
              <div className="text-center">
                <Spinner size="sm" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Small</p>
              </div>
              <div className="text-center">
                <Spinner size="md" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Medium</p>
              </div>
              <div className="text-center">
                <Spinner size="lg" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Large</p>
              </div>
              <div className="text-center">
                <Spinner size="xl" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Extra Large</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-8 mt-6">
              <div className="text-center">
                <Spinner variant="primary" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Primary</p>
              </div>
              <div className="text-center">
                <Spinner variant="white" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">White</p>
              </div>
              <div className="text-center">
                <Spinner text="Loading..." />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">With Text</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Section */}
        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
            <CardDescription>Modern modal dialogs with backdrop blur</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </CardContent>
        </Card>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Modern Modal"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              This is a modern modal with backdrop blur, smooth animations, and contemporary styling.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ComponentsShowcase; 