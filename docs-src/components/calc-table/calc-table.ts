import {
	type State,
	all,
	asInteger,
	component,
	first,
	insertOrRemoveElement,
	on,
	setText,
	state,
} from "../../../";

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

		const columns = new Map<string, State<number[]>>();
		for (let i = 0; i < el.columns; i++) {
			columns.set(
				colHeads[i],
				state(Array.from({ length: el.rows }).map(() => 0)),
			);
		}

		const getColumnArray = (rowKey: string): number[] => {
			return Array.from(
				el.querySelectorAll<HTMLInputElement>(
					`tbody input[data-key="${rowKey}"]`,
				),
			).map((input) =>
				Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : 0,
			);
		};

		return [
			/* Create rows */
			first(
				"tbody",
				insertOrRemoveElement(
					(target) => el.rows - target.querySelectorAll("tr").length,
					{
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
							for (const [colKey, col] of columns) {
								col.set(getColumnArray(colKey));
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
							columns.set(
								colKey,
								state(
									Array.from({ length: el.rows }).map(
										() => 0,
									),
								),
							);
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
				on("change", (e) => {
					const colKey = (e.target as HTMLInputElement)?.dataset[
						"key"
					];
					columns.get(colKey!)?.set(getColumnArray(colKey!));
				}),
			),

			/* Calculate sums for each column */
			all(
				"tfoot td",
				setText((target: HTMLTableCellElement) =>
					String(
						columns
							.get(target.dataset["key"]!)
							?.get()
							.reduce((a, b) => a + b, 0) ?? 0,
					),
				),
			),
		];
	},
);
