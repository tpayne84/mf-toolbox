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
			public bool StateTransitionAliases(int id)
			{
				// Get all workflows.
				List<WorkflowAdmin> workflows = this.Vault.WorkflowOperations.GetWorkflowsAdmin().Cast<WorkflowAdmin>().ToList();

				// Filter to the workflow containing the state with the provided id.
				WorkflowAdmin workflow = workflows.Single(wf => wf.States.Cast<State>().Any(s => s.ID == id));

				// Extract the state from the workflow's states collection.
				StateTransition stateTransition = workflow.StateTransitions.Cast<StateTransition>().FirstOrDefault(st => st.ID == id);

				// Ensure a match was found.
				if (stateTransition != null)
				{
					// Clear the aliases.
					stateTransition.SemanticAliases.Value = string.Empty;

					// Save changes.
					this.Vault.WorkflowOperations.UpdateWorkflowAdmin(workflow);

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
			public bool StateAliases(int id)
			{
				// Get all workflows.
				List< WorkflowAdmin > workflows = this.Vault.WorkflowOperations.GetWorkflowsAdmin().Cast<WorkflowAdmin>().ToList();

				// Filter to the workflow containing the state with the provided id.
				WorkflowAdmin workflow = workflows.Single( wf => wf.States.Cast< State >().Any( s => s.ID == id ) );

				// Extract the state from the workflow's states collection.
				StateAdmin state = workflow.States.Cast< StateAdmin >().FirstOrDefault( s => s.ID == id );

				// Ensure a match was found.
				if( state != null )
				{
					// Clear the aliases.
					state.SemanticAliases.Value = string.Empty;

					// Save changes.
					this.Vault.WorkflowOperations.UpdateWorkflowAdmin( workflow );

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
			public void WorkflowAliases(int id)
			{
				// Get all workflows.
				List<WorkflowAdmin> workflows = this.Vault.WorkflowOperations.GetWorkflowsAdmin().Cast<WorkflowAdmin>().ToList();

				// Filter to the workflow with the provided id.
				WorkflowAdmin workflow = workflows.Single( wf => wf.Workflow.ID == id );

				// Clear the Aliases.
				workflow.SemanticAliases.Value = string.Empty;

				// Save changes.
				this.Vault.WorkflowOperations.UpdateWorkflowAdmin(workflow);
			}

			/// <summary>
			/// Clears the Aliases on the <see cref="PropertyDef"/> with the provided id.
			/// </summary>
			/// <param name="id">PropertyDef ID</param>
			public void PropertyAliases(int id)
			{
				// Get the PropertyDefAdmin with using the provided id.
				PropertyDefAdmin propDefAdmin = this.Vault.PropertyDefOperations.GetPropertyDefAdmin( id );
				
				// Clear the aliases.
				propDefAdmin.SemanticAliases.Value = string.Empty;

				// Save changes.
				this.Vault.PropertyDefOperations.UpdatePropertyDefAdmin( propDefAdmin );
			}

			/// <summary>
			/// Clears the aliases on the <see cref="ObjectClass"/>with the provided id.
			/// </summary>
			/// <param name="id"><see cref="ObjectClass"/> ID</param>
			public void ClassAliases(int id)
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
			public void ObjTypeAliases(int id)
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

			private Vault Vault { get; set; }
			private Settings settings { get; set; }

			public void ValueListAlias(int id, string alias )
			{
				throw new NotImplementedException();
			}

			public void ValueListAliases(int id, string[] aliases )
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
