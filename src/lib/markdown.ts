import type { Root, RootContent } from 'hast';
import { assetUrl } from './site';

// Local Markdown images and links use the same deployment base as component assets.
export function contentLinks() {
  return (tree: Root) => {
    function visit(node: Root | RootContent) {
      if (node.type === 'element') {
        const { properties } = node;
        if (node.tagName === 'a' && properties.href) {
          const href = String(properties.href);
          if (!href.startsWith('#')) {
            properties.href = /^\/(?!\/)/.test(href) ? assetUrl(href) : href;
            properties.target = '_blank';
            properties.rel = ['noopener', 'noreferrer'];
          }
        }
        if (node.tagName === 'img' && properties.src && /^\/(?!\/)/.test(String(properties.src))) {
          properties.src = assetUrl(String(properties.src));
        }
      }
      if ('children' in node) node.children.forEach(visit);
    }
    visit(tree);
  };
}
