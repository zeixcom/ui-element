import { AccordionPanel } from './components/accordion-panel/accordion-panel.ts'
import { CodeBlock } from './components/code-block/code-block.ts'
import { HelloWorld } from './components/hello-world/hello-world.ts'
import { InputButton } from './components/input-button/input-button.ts'
import { InputCheckbox } from './components/input-checkbox/input-checkbox.ts'
import { InputField } from './components/input-field/input-field.ts'
import { InputRadiogroup } from './components/input-radiogroup/input-radiogroup.ts'
import { LazyLoad } from './components/lazy-load/lazy-load.ts'
import { MediaContext } from './components/media-context/media-context.ts'
import { MyCounter } from './components/my-counter/my-counter.ts'
import { MySlider } from './components/my-slider/my-slider.ts'
import { ProductCatalog } from './components/product-catalog/product-catalog.ts'
import { SpinButton } from './components/spin-button/spin-button.ts'
import { TabList } from './components/tab-list/tab-list.ts'
import { TodoApp } from './components/todo-app/todo-app.ts'
// Import more custom elements here...

declare global {
	interface HTMLElementTagNameMap {
		'hello-world': HelloWorld
		'my-counter': MyCounter
		'my-slider': MySlider
		'input-button': InputButton
		'input-checkbox': InputCheckbox
		'input-radiogroup': InputRadiogroup
		'input-field': InputField
		'code-block': CodeBlock
		'tab-list': TabList
		'accordion-panel': AccordionPanel
		'lazy-load': LazyLoad
		'media-context': MediaContext
		'todo-app': TodoApp
		'product-catalog': ProductCatalog
		'spin-button': SpinButton
		// Add more custom elements here...
	}
}
