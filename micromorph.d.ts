// shortcut: micromorph's export map hides its declaration; remove when the package exports its types.
declare module "micromorph" {
  export default function micromorph(from: Node, to: Node): Promise<void>
}
