import {
	type Component,
	type State,
	all,
	asInteger,
	component,
	first,
	insertOrRemoveElement,
	on,
	setProperty,
	setText,
	state,
} from "../../../";

import { SpinButtonProps } from "../spin-button/spin-button";

export type CalcTableProps = {
	columns: number;
	rows: number;
};

export default component(
	"calc-table",
	{
		columns: asInteger(),
		rows: asInteger(),
	},
	(el) => {
		const colHeads = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const rowTemplate =
			el.querySelector<HTMLTemplateElement>(".calc-table-row");
		const colheadTemplate = el.querySelector<HTMLTemplateElement>(
			".calc-table-colhead",
		);
		const cellTemplate =
			el.querySelector<HTMLTemplateElement>(".calc-table-cell");
		if (!rowTemplate || !colheadTemplate || !cellTemplate)
			throw new Error("Missing template elements");

		const colSums = new Map<string, State<number>>();
		for (let i = 0; i < el.columns; i++) {
			colSums.set(colHeads[i], state(0));
		}

		const calcColumnSum = (rowKey: string): number => {
			return Array.from(
				el.querySelectorAll<HTMLInputElement>(
					`tbody input[data-key="${rowKey}"]`,
				),
			)
				.map((input) =>
					Number.isFinite(input.valueAsNumber)
						? input.valueAsNumber
						: 0,
				)
				.reduce((acc, val) => acc + val, 0);
		};

		return [
			/* Control number of rows / columns */
			setProperty(
				"rows",
				() =>
					el.querySelector<Component<SpinButtonProps>>(
						".rows spin-button",
					)?.value,
			),
			setProperty(
				"columns",
				() =>
					el.querySelector<Component<SpinButtonProps>>(
						".columns spin-button",
					)?.value,
			),

			/* Create rows */
			first(
				"tbody",
				insertOrRemoveElement(
					(target) => el.rows - target.querySelectorAll("tr").length,
					{
						position: "beforeend",
						create: (parent) => {
							const row = document.importNode(
								rowTemplate.content,
								true,
							).firstElementChild;
							if (!(row instanceof HTMLTableRowElement))
								throw new Error(
									`Expected <tr> as root in table row template, got ${row}`,
								);
							const rowKey = String(
								parent.querySelectorAll("tr").length + 1,
							);
							row.dataset["key"] = rowKey;
							row
								.querySelector("slot")
								?.replaceWith(document.createTextNode(rowKey));
							return row;
						},
						resolve: () => {
							for (const [colKey, colSum] of colSums) {
								colSum.set(calcColumnSum(colKey));
							}
						},
					},
				),
			),

			/* Create column headers */
			first(
				"thead tr",
				insertOrRemoveElement(
					(target) =>
						el.columns - (target.querySelectorAll("th").length - 1),
					{
						position: "beforeend",
						create: (parent) => {
							const cell = document.importNode(
								colheadTemplate.content,
								true,
							).firstElementChild;
							if (!(cell instanceof HTMLTableCellElement))
								throw new Error(
									`Expected <th> as root in column header template, got ${cell}`,
								);
							const colKey =
								colHeads[
									parent.querySelectorAll("th").length - 1
								];
							colSums.set(colKey, state(0));
							cell
								.querySelector("slot")
								?.replaceWith(document.createTextNode(colKey));
							return cell;
						},
					},
				),
			),

			/* Create input cells for each row */
			all(
				"tbody tr",
				insertOrRemoveElement(
					(target) =>
						el.columns - target.querySelectorAll("td").length,
					{
						position: "beforeend",
						create: (parent: HTMLElement) => {
							const cell = document.importNode(
								cellTemplate.content,
								true,
							).firstElementChild;
							if (!(cell instanceof HTMLTableCellElement))
								throw new Error(
									`Expected <td> as root in cell template, got ${cell}`,
								);
							const rowKey = parent.dataset["key"];
							const colKey =
								colHeads[parent.querySelectorAll("td").length];
							const input = cell.querySelector("input");
							if (!input)
								throw new Error(
									"No input found in cell template",
								);
							input.dataset["key"] = colKey;
							cell
								.querySelector("slot")
								?.replaceWith(
									document.createTextNode(
										`${colKey}${rowKey}`,
									),
								);
							return cell;
						},
					},
				),
			),

			/* Create empty cells for column sums */
			first(
				"tfoot tr",
				insertOrRemoveElement(
					(target) =>
						el.columns - target.querySelectorAll("td").length,
					{
						position: "beforeend",
						create: (parent) => {
							const cell = document.createElement("td");
							const colKey =
								colHeads[parent.querySelectorAll("td").length];
							cell.dataset["key"] = colKey;
							return cell;
						},
					},
				),
			),

			/* Update column values when cells change */
			all(
				"tbody input",
				on("change", (e: Event) => {
					const colKey = (e.target as HTMLInputElement)?.dataset[
						"key"
					];
					colSums.get(colKey!)?.set(calcColumnSum(colKey!));
				}),
			),

			/* Update sums for each column */
			all(
				"tfoot td",
				setText((target: HTMLTableCellElement) =>
					String(colSums.get(target.dataset["key"]!)!.get()),
				),
			),
		];
	},
);

declare global {
	interface HTMLElementTagNameMap {
		"calc-table": Component<CalcTableProps>;
	}
}
