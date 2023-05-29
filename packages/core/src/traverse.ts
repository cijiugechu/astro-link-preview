import type { DefaultTreeAdapterMap } from 'parse5'

function nodeIsElement(
  node: DefaultTreeAdapterMap['node']
): node is DefaultTreeAdapterMap['element'] {
  return node.nodeName[0] !== '#'
}

async function traverseNodes(
  node: DefaultTreeAdapterMap['node'],
  visitor: (node: DefaultTreeAdapterMap['node']) => Promise<void>
) {
  await visitor(node)
  if (
    nodeIsElement(node) ||
    node.nodeName === '#document' ||
    node.nodeName === '#document-fragment'
  ) {
    await Promise.all(
      node.childNodes.map(childNode => traverseNodes(childNode, visitor))
    )
  }
}

export { nodeIsElement, traverseNodes }
