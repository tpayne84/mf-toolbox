@Component({
  selector: 'alias-listing',
  template: `
  	<div class='listing-wrapper'>
  		<div class='listing-header'>{{HeaderCaption}}</div>
  		<div class='listing-content'>
  			<div *ngFor='let item of itemCollection'>
		        <div class='item-wrapper'>
		        	<div class='item-id'>{{ item.id }}</div>
		        	<div class='item-name'>{{ item.name }}</div>
		        	<div class='item-aliases'>
  						
			        	<!-- List Aliases -->
  						<div *ngFor='let alias of item.aliases'>
				        	<div class='item-alias'>
				        		<div class='item-display'>{{ alias }}</div>
				        		<div class='item-spacer'>&nbsp;</div>
				        		<div class='item-icon'><img alt='Remove Alias' src='#'></div>
				        	</div>
				        	<div class='item-alias'>
				        		<input class='add-item'>
				        		<div class='item-spacer'>&nbsp;</div>
				        		<div class='item-icon'><img alt='Add Alias' src='#'></div>
				        	</div>
  						</div>
		        	</div>
		        </div>
		    </div>
  		</div>
  	</div>
  `
});

export class StructureItem {
  constructor(
    public id: number,
    public name: string,
    public aliases: Array<string>) { }
}

export class MFToolbox {
  constructor() {
  	// TODO - Port the C# ViewModel to this class.
  }
}
