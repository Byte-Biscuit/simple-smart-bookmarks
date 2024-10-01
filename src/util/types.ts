/**
 * BookmarkTreeNode
 */
export interface BookmarkTreeNode {
    id: string;
    parentId: string;
    index: number;
    dateAdded: number;
    title?: string;
    url?: string;
    children?: BookmarkTreeNode[];
    dateGroupModified?: number;
}

/**
 * BookmarkTreeNode Inspection
 */
export interface BookmarkInspection {
    url: string;
    status: number;
    keywords?: string;
    description?: string;
    favicon?: string;
    note?: string;
}

/**
 * Frequently visited website
 */
export interface FrequentlyVisitedWebsite {
    id: string,
    name: string,
    url: string,
    favicon?: string,
    title?: string,
    ranking?: number,
    status?: number,
    createTime?: number,
}

/**
 * BookmarkList Header Breadcrumb
 */
export interface BookmarkListHeader {
    id: string,
    title: string,
}

/**
 * Search Engine
 */
export interface SearchEngine {
    name: string,
    url: string,
    default?: string
}

