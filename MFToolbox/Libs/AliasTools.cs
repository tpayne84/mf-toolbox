using System;
using System.Collections.Generic;
using System.Linq;
using MFilesAPI;

namespace MFToolbox.Libs
{
	/// <summary>
	/// Alias Tools class.
	/// </summary>
	public class AliasTools
	{
		/// <summary>
		/// Static resolution class.
		/// </summary>
		public static class resolve
		{
			/// <summary>
			/// Resolves a property by its id.
			/// </summary>
			/// <param name="v"><see cref="Vault"/></param>
			/// <param name="id">Property ID</param>
			/// <returns><see cref="PropertyDefAdmin"/></returns>
			public static PropertyDefAdmin propertyDefById(Vault v, int id) => v.PropertyDefOperations.GetPropertyDefAdmin( id );

			/// <summary>
			/// Resolves a workflow by id.
			/// </summary>
			/// <param name="v"><see cref="Vault"/></param>
			/// <param name="id">Workflow ID</param>
			/// <returns><see cref="WorkflowAdmin"/></returns>
			public static WorkflowAdmin workflowById(Vault v, int id)
			{
				// Get all workflows.
				List<WorkflowAdmin> workflows = v.WorkflowOperations.GetWorkflowsAdmin().Cast<WorkflowAdmin>().ToList();

				// Filter to the workflow containing the state with the provided id.
				return workflows.Single( wf => wf.Workflow.ID == id );
			}

			/// <summary>
			/// Resolves a state by state.id
			/// </summary>
			/// <param name="v"><see cref="Vault"/></param>
			/// <param name="id">State ID</param>
			/// <param name="wfAdmin">Resolved <see cref="StateAdmin"/>'s owner <see cref="WorkflowAdmin"/></param>
			/// <returns><see cref="StateAdmin"/>State with the passed id.</returns>
			public static StateAdmin stateById(Vault v, int id, out WorkflowAdmin wfAdmin)
			{
				// Get all workflows.
				List<WorkflowAdmin> workflows = v.WorkflowOperations.GetWorkflowsAdmin().Cast<WorkflowAdmin>().ToList();

				// Filter to the workflow containing the state with the provided id.
				wfAdmin = workflows.Single(wf => wf.States.Cast<State>().Any(s => s.ID == id));

				// Ensure a result was found / extract the state from the workflow's states collection.
				return wfAdmin?.States.Cast<StateAdmin>().FirstOrDefault(s => s.ID == id);
			}

			/// <summary>
			/// Resolves a state transition by state.transition.id
			/// </summary>
			/// <param name="v"><see cref="Vault"/></param>
			/// <param name="id">State Transition ID</param>
			/// <param name="wfAdmin">Resolved <see cref="StateTransition"/>'s owner <see cref="WorkflowAdmin"/></param>
			/// <returns><see cref="StateAdmin"/>State with the passed id.</returns>
			public static StateTransition stateTransitionById(Vault v, int id, out WorkflowAdmin wfAdmin)
			{
				// Get all workflows.
				List<WorkflowAdmin> workflows = v.WorkflowOperations.GetWorkflowsAdmin().Cast<WorkflowAdmin>().ToList();

				// Filter to the workflow containing the state with the provided id.
				wfAdmin = workflows.Single( wf => wf.StateTransitions.Cast< StateTransition >().Any( s => s.ID == id ) );

				// Ensure a result was found / extract the state from the workflow's states collection.
				return wfAdmin?.StateTransitions.Cast< StateTransition >().FirstOrDefault( st => st.ID == id );
			}

			/// <summary>
			/// Resolves an <see cref="ObjectClassAdmin"/> by ID.
			/// </summary>
			/// <param name="v"><see cref="Vault"/></param>
			/// <param name="id">Class ID</param>
			/// <returns><see cref="ObjectClassAdmin"/></returns>
			public static ObjectClassAdmin classById( Vault v, int id ) => v.ClassOperations.GetAllObjectClassesAdmin().Cast< ObjectClassAdmin >().FirstOrDefault( oc => oc.ID == id );

			public static ObjTypeAdmin objTypeById( Vault v, int id ) => v.ObjectTypeOperations.GetObjectTypesAdmin().Cast< ObjTypeAdmin >().FirstOrDefault( x => x.ObjectType.ID == id );
		}

		#region Inner Classes

		/// <summary>
		/// Alias Settings used with the Alias Tools class.
		/// </summary>
		public class Settings
		{
			/// <summary>
			/// Options for Space handling in auto alias naming.
			/// </summary>
			public enum SpaceHandling
			{
				/// <summary>
				/// No modification.
				/// </summary>
				None = 0,

				/// <summary>
				/// Spaces are removed.
				/// </summary>
				Remove = 1,

				/// <summary>
				/// Spaces are substituted for underscores.
				/// </summary>
				Snake_Case = 2
			}

			/// <summary>
			/// Template String used like the String.Format(); method in c#.
			/// Replacement for {0} is the Name | Name Singular.
			/// For ObjTypes {1} us the Name Plural.
			/// </summary>
			public string AliasMask { get; set; }

			/// <summary>
			/// When true, this will prevent removal of aliases that do not conform to the alias mask?
			/// </summary>
			public bool PreserveCustomAliases { get; set; }

			/// <summary>
			/// Should the Name be converted to Title Case?
			/// </summary>
			public bool TitleCase { get; set; }

			/// <summary>
			/// How should spaces be handled?
			/// </summary>
			public SpaceHandling SpaceHandler { get; set; }

			/// <summary>
			/// When true duplicate aliases are auto numbered.
			/// Example: Property.AliasTest => Property.AliasTest2 => Property.AliasTest3
			/// </summary>
			public bool AutoNumberDuplicates { get; set; }

			/// <summary>
			/// Self initializing constructor.
			/// </summary>
			/// <param name="aliasMask">Template String used like the String.Format(); method in c#.</param>
			/// <param name="titleCase">Should the Name be converted to Title Case?</param>
			/// <param name="spaceHandler"> How should spaces be handled?</param>
			/// <param name="autoNumberDuplicates">When true duplicate aliases are auto numbered.</param>
			public Settings( string aliasMask, bool titleCase, SpaceHandling spaceHandler, bool autoNumberDuplicates )
			{
				AliasMask = aliasMask;
				TitleCase = titleCase;
				SpaceHandler = spaceHandler;
				AutoNumberDuplicates = autoNumberDuplicates;
			}
		}
		public class clear
		{
			/// <summary>
			/// Initializes a new instance of the <see cref="T:System.Object"/> class.
			/// </summary>
			public clear( Vault v, Settings options )
			{
				this.settings = options;
				this.Vault = v;
			}

			private Vault  Vault { get; set; }

			private Settings settings { get; set; }

			public void ValueListAliases(int id)
			{
				throw new NotImplementedException();
			}

			/// <summary>
			/// Clears the aliases of <see cref="StateTransition"/> with the provided id.
			/// </summary>
			/// <param name="id">State Transition ID</param>
			public bool StateTransitionAlias(int id)
			{
				WorkflowAdmin wfAdmin;

				// Extract the state from the workflow's states collection.
				StateTransition stateTransition = resolve.stateTransitionById( this.Vault, id, out wfAdmin );

				// Ensure a match was found.
				if (stateTransition != null)
				{
					// Clear the aliases.
					stateTransition.SemanticAliases.Value = string.Empty;

					// Save changes.
					this.Vault.WorkflowOperations.UpdateWorkflowAdmin(wfAdmin);

					// Return true as a match was not found.
					return true;
				}

				// Return false as a match was not found.
				return false;
			}

			/// <summary>
			/// Clears the aliases of the <see cref="State"/> with the given id.
			/// </summary>
			/// <param name="id">State ID</param>
			public bool StateAlias(int id)
			{
				// Workflow State owner.
				WorkflowAdmin wfAdmin;

				// Resolve the state admin, by state id.
				StateAdmin state = resolve.stateById( this.Vault, id, out wfAdmin );

				// Ensure a match was found.
				if( state != null )
				{
					// Clear the aliases.
					state.SemanticAliases.Value = string.Empty;

					// Save changes.
					this.Vault.WorkflowOperations.UpdateWorkflowAdmin( wfAdmin );

					// Return true as a match was not found.
					return true;
				}

				// Return false as a match was not found.
				return false;
			}

			/// <summary>
			/// Clears the workflow aliases of the <see cref="Workflow"/> with the provide id.
			/// </summary>
			/// <param name="id">Workflow ID</param>
			public void WorkflowAlias(int id)
			{
				// Resolve the workflow admin.
				WorkflowAdmin workflow = resolve.workflowById( this.Vault, id );

				// Clear the Aliases.
				workflow.SemanticAliases.Value = string.Empty;

				// Save changes.
				this.Vault.WorkflowOperations.UpdateWorkflowAdmin( workflow );
			}

			/// <summary>
			/// Clears the Aliases on the <see cref="PropertyDef"/> with the provided id.
			/// </summary>
			/// <param name="id">PropertyDef ID</param>
			public void PropertyAlias(int id)
			{
				// Get the PropertyDefAdmin with using the provided id.
				PropertyDefAdmin propDefAdmin = resolve.propertyDefById( this.Vault, id );
				
				// Clear the aliases.
				propDefAdmin.SemanticAliases.Value = string.Empty;

				// Save changes.
				this.Vault.PropertyDefOperations.UpdatePropertyDefAdmin( propDefAdmin );
			}

			/// <summary>
			/// Clears the aliases on the <see cref="ObjectClass"/>with the provided id.
			/// </summary>
			/// <param name="id"><see cref="ObjectClass"/> ID</param>
			public void ClassAlias(int id)
			{
				// Get the Class Admin with the provided id.
				ObjectClassAdmin classAdmin = this.Vault.ClassOperations.GetObjectClassAdmin( id );

				// Clear the aliases.
				classAdmin.SemanticAliases.Value = string.Empty;

				// Save changes.
				this.Vault.ClassOperations.UpdateObjectClassAdmin( classAdmin );
			}

			/// <summary>
			/// Clears the aliases on the <see cref="ObjType"/> with the provided id.
			/// </summary>
			/// <param name="id">Object ID</param>
			public void ObjTypeAlias(int id)
			{
				// Get the ObjType Admin using the provided id.
				ObjTypeAdmin objAdmin = this.Vault.ObjectTypeOperations.GetObjectTypeAdmin( id );

				// Clear the aliases.
				objAdmin.SemanticAliases.Value = string.Empty;

				// Save changes.
				this.Vault.ObjectTypeOperations.UpdateObjectTypeAdmin( objAdmin );
			}
		}
		public class add
		{
			/// <summary>
			/// Initializes a new instance of the <see cref="T:System.Object"/> class.
			/// </summary>
			public add(Vault v, Settings options )
			{
				this.Vault = v;
				this.settings = options;
			}

			private Vault Vault { get; set; }
			private Settings settings { get; set; }

			public void ValueListAlias(int id, string alias)
			{
				throw new NotImplementedException();
			}

			public void ValueListAliases(int id, string[] aliases)
			{
				throw new NotImplementedException();
			}

			public void StateTransitionAlias(int id, string alias)
			{
				throw new NotImplementedException();
			}

			public void StateTransitionAliases(int id, string[] aliases)
			{
				throw new NotImplementedException();
			}

			public void StateAlias(int id, string alias)
			{
				throw new NotImplementedException();
			}

			public void StateAliases(int id, string[] aliases)
			{
				throw new NotImplementedException();
			}

			public void WorkflowAlias(int id, string alias)
			{
				throw new NotImplementedException();
			}

			public void WorkflowAliases(int id, string[] aliases)
			{
				throw new NotImplementedException();
			}

			public void PropertyAlias(int id, string alias)
			{
				throw new NotImplementedException();
			}
			public void PropertyAliases(int id, string[] aliases)
			{
				throw new NotImplementedException();
			}

			public void ClassAlias(int id, string alias)
			{
				throw new NotImplementedException();
			}
			public void ClassAliases(int id, string[] aliases)
			{
				throw new NotImplementedException();
			}

			public void ObjTypeAlias(int id, string alias)
			{
				throw new NotImplementedException();
			}

			public void ObjTypeAliases(int id, string[] aliases)
			{
				throw new NotImplementedException();
			}

		}
		public class remove
		{
			/// <summary>
			/// Initializes a new instance of the <see cref="T:System.Object"/> class.
			/// </summary>
			public remove(Vault v, Settings options)
			{
				this.settings = options;
				this.Vault = v;
			}

			/// <summary>
			/// Utility method used to remove an alias from a semantic aliases object.
			/// </summary>
			/// <param name="aliases"><see cref="SemanticAliases"/></param>
			/// <param name="toRemove">Alias to remove</param>
			/// <returns>True when removed.</returns>
			private bool removeAlias(SemanticAliases aliases, string toRemove)
			{
				// Get the aliases.
				List<string> results = aliases.Value.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries).ToList();

				// Check for aliases.
				if (results.Any())
				{
					// There are aliases, process them.
					if (results.Contains(toRemove))
					{
						// Remove this alias.
						results.Remove(toRemove);
						return true;
					}
				}

				return false;
			}

			/// <summary>
			/// Local <see cref="Vault"/> reference.
			/// </summary>
			private Vault Vault { get; set; }

			/// <summary>
			/// Format settings.
			/// </summary>
			private Settings settings { get; set; }

			/// <summary>
			/// Value List Alias Removal.
			/// </summary>
			/// <param name="id">Value List ID.</param>
			/// <param name="alias">Alias to remove.</param>
			public void ValueListAlias(int id, string alias )
			{
				throw new NotImplementedException();
			}

			/// <summary>
			/// Value List Alias Removal.
			/// </summary>
			/// <param name="id">Value List ID.</param>
			/// <param name="aliases">Aliases to remove.</param>
			public void ValueListAliases(int id, string[] aliases )
			{
				throw new NotImplementedException();
			}

			/// <summary>
			/// State Transition Alias Removal.
			/// </summary>
			/// <param name="id">State Transition ID.</param>
			/// <param name="alias">Alias to remove.</param>
			public void StateTransitionAlias(int id, string alias)
			{
				WorkflowAdmin wfAdmin;
				StateTransition stateTransition = resolve.stateTransitionById( this.Vault, id, out wfAdmin );

				// Search and Destroy.
				if( removeAlias(stateTransition.SemanticAliases, alias) )
				{
					// Save changes.
					this.Vault.WorkflowOperations.UpdateWorkflowAdmin(wfAdmin);
				}
			}

			/// <summary>
			/// State Transition Alias Removal.
			/// </summary>
			/// <param name="id">State Transition ID.</param>
			/// <param name="aliases">Aliases to remove.</param>
			public void StateTransitionAliases(int id, string[] aliases)
			{
				// Pass through loop.
				foreach( string alias in aliases )
					StateTransitionAlias( id, alias );
			}

			/// <summary>
			/// State Alias Removal.
			/// </summary>
			/// <param name="id">State ID</param>
			/// <param name="alias">Alias to remove.</param>
			public void StateAlias(int id, string alias)
			{
				WorkflowAdmin wfAdmin;
				StateAdmin state = resolve.stateById( this.Vault, id, out wfAdmin );

				// Search and Destroy.
				if (removeAlias(state.SemanticAliases, alias))
				{
					// Save changes.
					this.Vault.WorkflowOperations.UpdateWorkflowAdmin( wfAdmin );
				}
			}

			/// <summary>
			/// State Alias Removal.
			/// </summary>
			/// <param name="id">State ID</param>
			/// <param name="aliases">Aliases to remove.</param>
			public void StateAliases(int id, string[] aliases)
			{
				// Pass through.
				foreach( string alias in aliases )
					StateAlias( id, alias );
			}

			/// <summary>
			/// Workflow Alias Removal.
			/// </summary>
			/// <param name="id">Workflow ID</param>
			/// <param name="alias">Alias to remove.</param>
			public void WorkflowAlias(int id, string alias)
			{

				// Resolve the WorkflowAdmin.
				WorkflowAdmin wfAdmin = resolve.workflowById( this.Vault, id );

				// Search and Destroy.
				if (removeAlias(wfAdmin.SemanticAliases, alias))
				{
					// Save changes.
					this.Vault.WorkflowOperations.UpdateWorkflowAdmin(wfAdmin);
				}
			}

			/// <summary>
			/// Workflow Alias Removal.
			/// </summary>
			/// <param name="id">Workflow ID</param>
			/// <param name="aliases">Aliases to remove.</param>
			public void WorkflowAliases(int id, string[] aliases)
			{
				// Pass through.
				foreach( string alias in aliases )
					WorkflowAlias( id, alias );
			}

			/// <summary>
			/// Removes an alias from a PropertyDef.
			/// </summary>
			/// <param name="id">PropertyDef ID.</param>
			/// <param name="alias">Alias to remove.</param>
			public void PropertyAlias(int id, string alias)
			{
				// Resolve the PropertyDef.
				PropertyDefAdmin pda = resolve.propertyDefById( this.Vault, id );

				// Search and Destroy.
				if (removeAlias(pda.SemanticAliases, alias))
				{
					// Save changes.
					this.Vault.PropertyDefOperations.UpdatePropertyDefAdmin( pda );
				}
			}

			/// <summary>
			/// Removes an alias from a PropertyDef.
			/// </summary>
			/// <param name="id">PropertyDef ID.</param>
			/// <param name="aliases">Alias to remove.</param>
			public void PropertyAliases(int id, string[] aliases)
			{
				// Pass through.
				foreach( string alias in aliases )
					PropertyAlias( id, alias );
			}

			/// <summary>
			/// Removes a alias from a <see cref="ObjectClass"/>.
			/// </summary>
			/// <param name="id">Class ID</param>
			/// <param name="alias">Alias to remove.</param>
			public void ClassAlias(int id, string alias)
			{
				// Resolve the ObjectClass Admin.
				ObjectClassAdmin objClass = resolve.classById( this.Vault, id );

				// Search and Destroy.
				if (removeAlias(objClass.SemanticAliases, alias))
				{
					// Save changes.
					this.Vault.ClassOperations.UpdateObjectClassAdmin( objClass );
				}
			}

			/// <summary>
			/// Removes a alias from a <see cref="ObjectClass"/>.
			/// </summary>
			/// <param name="id">Class ID</param>
			/// <param name="aliases">Aliases to remove.</param>
			public void ClassAliases(int id, string[] aliases)
			{
				// Pass through.
				foreach( string alias in aliases )
					ClassAlias( id, alias );
			}

			/// <summary>
			/// Removes a alias from a <see cref="ObjType"/>.
			/// </summary>
			/// <param name="id">Object Type ID</param>
			/// <param name="alias">Alias to remove.</param>
			public void ObjTypeAlias(int id, string alias)
			{
				// Resolve the ObjTypeAdmin
				ObjTypeAdmin ota = resolve.objTypeById(this.Vault, id);

				// Search and Destroy.
				if (removeAlias(ota.SemanticAliases, alias))
				{
					// Save changes.
					this.Vault.ObjectTypeOperations.UpdateObjectTypeAdmin( ota );
				}
			}

			/// <summary>
			/// Removes a alias from a <see cref="ObjType"/>.
			/// </summary>
			/// <param name="id">Object Type ID</param>
			/// <param name="aliases">Aliases to remove.</param>
			public void ObjTypeAliases(int id, string[] aliases)
			{
				// Pass through.
				foreach (string alias in aliases)
					ObjTypeAlias(id, alias);
			}
		}

		#endregion

		#region Private Methods

		/// <summary>
		/// Given a structure item name and the generated alias, this method will determine if the alias is custom.
		/// </summary>
		/// <param name="name">Structure Item Name</param>
		/// <param name="alias">Generated Alias</param>
		/// <returns>True if the alias is a custom ( non-auto-generated ) alias.</returns>
		private bool isAliasCustom( string name, string alias )
		{
			throw new NotImplementedException();
		}

		/// <summary>
		/// Determines if an alias already exists in the vault.
		/// </summary>
		/// <param name="type"><see cref="MFMetadataStructureItem"/> Type to check.</param>
		/// <param name="alias">Alias to look for.</param>
		/// <returns>True when the alias already exists in a vault.</returns>
		private bool aliasExists( MFMetadataStructureItem type, string alias )
		{
			throw new NotImplementedException();
		}

		/// <summary>
		/// Formats an alias using the given settings.
		/// </summary>
		/// <param name="name"></param>
		/// <returns>Alias string formatted according to the specified settings.</returns>
		private string formatAlias( string name )
		{
			throw new NotImplementedException();
		}

		#endregion

		/// <summary>
		/// Add / Append Actions.
		/// </summary>
		public add Add{ get; set; }

		/// <summary>
		/// Removal Actions.
		/// </summary>
		public remove Remove { get; set; }

		/// <summary>
		/// Clear All Actions.
		/// </summary>
		public clear Clear { get; set; }

		public Vault Vault { get; set; }

		private Settings settings { get; set; }

		/// <summary>
		/// Self initializing constructor.
		/// </summary>
		/// <param name="v"></param>
		public AliasTools(Vault v)
		{
			this.Vault = v;
			this.Add = new add( v, this.settings );
			this.Remove = new remove( v, this.settings );
			this.Clear= new clear( v, this.settings );
		}
	}
}
