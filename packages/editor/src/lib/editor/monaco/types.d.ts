class Class {}

declare module "*.json?theme" {
	const src: import("monaco-editor").editor.IStandaloneThemeData;
	export default src;
}

declare module "monaco-editor/esm/vs/base/common/actions" {
	export class Separator {
		constructor();
	}
}

declare module "monaco-editor/esm/vs/editor/browser/editorExtensions" {
	import type { InstantiationAccessor } from "monaco-editor/esm/vs/platform/instantiation/common/instantiationService";
	export function registerEditorAction<T extends EditorAction>(action: typeof T): T;

	export interface EditorActionOptions {
		id: string;
		label: string;
		alias: string;
		precondition?: ContextKeyExpr;
		kbOpts?: {
			primary: number[];
		};
	}

	export class EditorAction {
		public id: string;
		public label: string;
		public alias: string;

		public constructor(opts: EditorActionOptions);
		public run(accessor: InstantiationAccessor): void;
	}
}

declare module "monaco-editor/esm/vs/platform/instantiation/common/instantiationService" {
	export interface InstantiationAccessor {
		public static get<T>(ctor: T): InstanceType<T>;
	}
}

declare module "monaco-editor/esm/vs/platform/contextkey/common/contextkey" {
	export class ContextKeyExpr {
		public static deserialize(serialized: string): ContextKeyExpr;
	}
}

declare module "monaco-editor/esm/vs/platform/quickinput/common/quickInput" {
	export class IQuickInputService {
		public quickAccess: {
			show(prefix: string): void;
		};
	}
}

declare module "monaco-editor/esm/vs/base/common/lifecycle" {
	import type { IDisposable } from "monaco-editor";

	export class DisposableStore {
		public add(disposable: IDisposable): IDisposable;
	}
}

declare module "monaco-editor/esm/vs/platform/registry/common/platform" {
	export class Registry {
		public static as<T>(ctor: T): InstanceType<T>;
	}
}

declare module "monaco-editor/esm/vs/platform/quickinput/common/quickAccess" {
	export interface QuickAccessProviderOptions {
		ctor: typeof Class;
		helpEntries: { description: string; commandId: string }[];
		prefix: string;
	}

	export interface QuickAccessItem {
		label: string;
		ariaLabel: string;
		description: string;
	}

	export interface QuickAccessPicker {
		onDidAccept(callback: () => void): IDisposable;
		selectedItems: QuickAccessItem[];
		items: QuickAccessItem[];
	}

	export interface QuickAccessProvider {
		provide(picker: QuickAccessPicker): IDisposable | void;
	}
	
	export namespace Extensions {
		export class Quickaccess {
			public providers: QuickAccessProviderOptions[];
			public registerQuickAccessProvider(options: QuickAccessProviderOptions): void;
		}
	}
}