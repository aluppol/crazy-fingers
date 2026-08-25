export enum OpfElement {
  Rootfile = 'rootfile',
  Title = 'title',
  Creator = 'creator',
  Spine = 'spine',
  ItemReference = 'itemref',
  Item = 'item',
}

export enum OpfAttribute {
  FullPath = 'full-path',
  IdReference = 'idref',
  Linear = 'linear',
  Id = 'id',
  Href = 'href',
  MediaType = 'media-type',
  Properties = 'properties',
  TableOfContents = 'toc',
}

export enum OpfProperty {
  Navigation = 'nav',
}

export enum EpubPath {
  Container = 'META-INF/container.xml',
}

export enum EpubNavigationType {
  TableOfContents = 'toc',
}

export enum NcxElement {
  NavigationPoint = 'navPoint',
  Content = 'content',
  Text = 'text',
}

export enum NcxAttribute {
  Source = 'src',
}
