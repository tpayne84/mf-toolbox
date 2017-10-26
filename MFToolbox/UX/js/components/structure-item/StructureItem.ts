class StructureItem {
  constructor(
    public id: number,
    public name: string,
    public guid: string,
    public aliases: Array<string>) { }
}

export default StructureItem;