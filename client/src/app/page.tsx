'use client';

import { useTheme } from '@/hooks/useTheme';
import { TypingTestDemo } from '@/components/TypingTestDemo';
import { ToastColorDemo } from '@/components/ToastSystem';
import { FontTestDemo } from '@/components/FontTestDemo';
import Keyboard from '@/components/Keyboard';
import Input from '@/components/Input';
import { useState } from 'react';
import Switch from '@/components/Switch';
import Textarea from '@/components/Textarea';
import Select from '@/components/Select';
import { RadioGroup, RadioGroupItem } from '@/components/RadioGroup';

export default function Home() {
	const { theme, font } = useTheme();
	const [inputValue, setInputValue] = useState('');
	const [switchState, setSwitchState] = useState(false);
	const [selectedOption, setSelectedOption] = useState<string>('banana');
	const [selectedRadio, setSelectedRadio] = useState<string>('option1');

	return (
		<div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<main className="flex flex-col gap-8 items-center">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-foreground mb-4">
						Typing Test Theme Showcase
					</h1>
					<p className="text-lg text-muted-foreground mb-8">
						Experience beautiful themes and fonts optimized for typing tests
					</p>
					<div className="flex gap-4 items-center justify-center text-sm text-muted-foreground">
						<span className="px-3 py-1 bg-secondary rounded-full">
							Current Theme: <span className="font-medium text-secondary-foreground capitalize">{theme}</span>
						</span>
						<span className="px-3 py-1 bg-secondary rounded-full">
							Current Font: <span className="font-medium text-secondary-foreground capitalize">{font}</span>
						</span>
					</div>
				</div>

				{/* Typing Test Demo */}
				<div className="w-full max-w-4xl">
					<TypingTestDemo />
				</div>

				{/* Font Test Demo */}
				<div className="w-full max-w-4xl">
					<FontTestDemo />
				</div>

				{/* Toast Color Demo */}
				<div className="w-full max-w-4xl">
					<ToastColorDemo />
				</div>

				{/* Feature Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
					<div className="bg-card p-6 rounded-lg border border-border hover:border-border-hover transition-colors">
						<h3 className="text-xl font-semibold text-card-foreground mb-3">Typing-Optimized Themes</h3>
						<p className="text-muted-foreground mb-4">
							7 beautiful themes with distinct colors for correct, incorrect, untyped, and current character states.
						</p>
						<div className="flex gap-2">
							<div className="w-4 h-4 rounded-full bg-correct"></div>
							<div className="w-4 h-4 rounded-full bg-incorrect"></div>
							<div className="w-4 h-4 rounded-full bg-untyped"></div>
							<div className="w-4 h-4 rounded-full bg-cursor"></div>
						</div>
					</div>

					<div className="bg-card p-6 rounded-lg border border-border hover:border-border-hover transition-colors">
						<h3 className="text-xl font-semibold text-card-foreground mb-3">Optimized Fonts</h3>
						<p className="text-muted-foreground mb-4">
							12 carefully selected fonts for optimal typing experience, including monospace options.
						</p>
						<div className="text-primary font-medium">The quick brown fox</div>
					</div>

					<div className="bg-card p-6 rounded-lg border border-border hover:border-border-hover transition-colors">
						<h3 className="text-xl font-semibold text-card-foreground mb-3">Smart Notifications</h3>
						<p className="text-muted-foreground mb-4">
							Context-aware toast notifications with theme-consistent colors for success, error, warning, and info states.
						</p>
						<div className="flex gap-1">
							<div className="w-3 h-3 rounded bg-toast-success"></div>
							<div className="w-3 h-3 rounded bg-toast-error"></div>
							<div className="w-3 h-3 rounded bg-toast-warning"></div>
							<div className="w-3 h-3 rounded bg-toast-info"></div>
						</div>
					</div>
				</div>

				{/* Color Reference */}
				<div className="w-full max-w-4xl">
					<div className="bg-card p-6 rounded-lg border border-border">
						<h3 className="text-lg font-semibold text-card-foreground mb-4">Color Reference</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div className="space-y-2">
								<h4 className="font-medium text-card-foreground">Typing States</h4>
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-correct"></div>
										<span className="text-muted-foreground">Correct</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-incorrect"></div>
										<span className="text-muted-foreground">Incorrect</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-untyped"></div>
										<span className="text-muted-foreground">Untyped</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-cursor"></div>
										<span className="text-muted-foreground">Cursor</span>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium text-card-foreground">Notifications</h4>
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-toast-success"></div>
										<span className="text-muted-foreground">Success</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-toast-error"></div>
										<span className="text-muted-foreground">Error</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-toast-warning"></div>
										<span className="text-muted-foreground">Warning</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-toast-info"></div>
										<span className="text-muted-foreground">Info</span>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium text-card-foreground">Interface</h4>
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-primary"></div>
										<span className="text-muted-foreground">Primary</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-secondary"></div>
										<span className="text-muted-foreground">Secondary</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-accent"></div>
										<span className="text-muted-foreground">Accent</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-muted"></div>
										<span className="text-muted-foreground">Muted</span>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium text-card-foreground">System</h4>
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-background border border-border"></div>
										<span className="text-muted-foreground">Background</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-foreground"></div>
										<span className="text-muted-foreground">Foreground</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-border"></div>
										<span className="text-muted-foreground">Border</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded bg-destructive"></div>
										<span className="text-muted-foreground">Destructive</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<Keyboard activeKeys={['LShift', 'A']} />
				<div className="w-full max-w-4xl bg-card p-6 rounded-lg border border-border">
					<div className="text-lg font-semibold mb-4 text-card-foreground">Input demo</div>
					<Input
						value={inputValue}
						onChange={(val) => setInputValue(val)}
						placeholder="Type here..."
						className=""
						label="Test label"
					/>
				</div>
				<Switch
					state={switchState}
					setState={setSwitchState}
				/>
				<Textarea
					className="w-full max-w-4xl h-32 p-4 border border-border rounded-lg bg-background text-foreground"
					placeholder="This is a textarea. Press Tab to insert a tab character."
				/>
				<Select
					options={[
						{ value: "apple", label: "Apple BUN 🍎 BANANA BUN BAN BAN ADFASDF SADF SADFS ADFSA DFS  " },
						{ value: "banana", label: "Banana" },
						{ value: "cherry", label: "Cherry" },
					]}
					placeholder="Choose fruit..."
					value={selectedOption}
					onChange={(v) => {
						setSelectedOption(v);
					}}
				/>
				<RadioGroup
					name="example"
					value={selectedRadio}
					onValueChange={(v) => {
						setSelectedRadio(v);
					}}
				>
					<RadioGroupItem value="option1">Option 1</RadioGroupItem>
					<RadioGroupItem value="option2">Option 2</RadioGroupItem>
					<RadioGroupItem value="option3" disabled>Option 3 (Disabled)</RadioGroupItem>
				</RadioGroup>
				<footer className="text-center text-muted-foreground">
					<p>Click the customize button in the top right to change themes and fonts!</p>
					<p className="text-xs mt-2">Font changes are applied instantly to the entire page</p>
				</footer>
			</main>
		</div>
	);
}