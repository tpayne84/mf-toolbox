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
		public static class Resolve
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
				// ReSharper disable once InconsistentNaming - On Purpose to demonstrate the snake_case convention.
				Snake_Case = 2
			}

			/// <summary>
			/// Template String used like the String.Format(); method in c#.
			/// Replacement for {0} is the type: ObjType|ObjectClass|PropertyDef|ValueList|Workflow|State|StateTransition.
			/// Replacement for {1} is the Name | Name Singular.
			/// For ObjTypes {2} is the Name Plural.
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
			/// MFToolbox Alias Defaults.
			/// </summary>
			public class Default
			{
				/// <summary>
				/// Naming Replacement : $0 : Default: "ObjType"
				/// </summary>
				public const string ObjType = "ObjType";

				/// <summary>
				/// Naming Replacement : $0 : Default: "Class"
				/// </summary>
				public const string ObjectClass = "Class";

				/// <summary>
				/// Naming Replacement : $0 : Default: "Property"
				/// </summary>
				public const string PropertyDef = "Property";
				
				/// <summary>
				/// Naming Replacement : $0 : Default: "Workflow"
				/// </summary>
				public const string Workflow = "Workflow";

				/// <summary>
				/// Naming Replacement : $0 : Default: "State"
				/// </summary>
				public const string State = "State";

				/// <summary>
				/// Naming Replacement : $0 : Default: "StateTransition"
				/// </summary>
				public const string StateTransition = "StateTransition";
			}

			/// <summary>
			/// MFToolbox Alias Shorthand Defaults.
			/// </summary>
			public class Shorthand
			{
				/// <summary>
				/// Naming Replacement : $0 : Default: "OT"
				/// </summary>
				public const string ObjType = "OT";

				/// <summary>
				/// Naming Replacement : $0 : Default: "OC"
				/// </summary>
				public const string ObjectClass = "OC";

				/// <summary>
				/// Naming Replacement : $0 : Default: "PD"
				/// </summary>
				public const string PropertyDef = "PD";
				
				/// <summary>
				/// Naming Replacement : $0 : Default: "WF"
				/// </summary>
				public const string Workflow = "WF";

				/// <summary>
				/// Naming Replacement : $0 : Default: "WFS"
				/// </summary>
				public const string State = "WFS";

				/// <summary>
				/// Naming Replacement : $0 : Default: "WFST"
				/// </summary>
				public const string StateTransition = "WFST";
			}

			/// <summary>
			/// When true, shorthand syntax is used.
			/// </summary>
			public bool UseShorthand { get; set; } = false;

			/// <summary>
			/// Naming Replacement : $0 : Default: "ObjType"
			/// </summary>
			public string NameObjType { get; set; } = Default.ObjType;

			/// <summary>
			/// Naming Replacement : $0 : Default: "Class"
			/// </summary>
			public string NameObjectClass { get; set; } = Default.ObjectClass;

			/// <summary>
			/// Naming Replacement : $0 : Default: "Property"
			/// </summary>
			public string NamePropertyDef { get; set; } = Default.PropertyDef;

			/// <summary>
			/// Naming Replacement : $0 : Default: "Workflow"
			/// </summary>
			public string NameWorkflow { get; set; } = Default.Workflow;

			/// <summary>
			/// Naming Replacement : $0 : Default: "State"
			/// </summary>
			public string NameState { get; set; } = Default.State;

			/// <summary>
			/// Naming Replacement : $0 : Default: "StateTransition"
			/// </summary>
			public string NameStateTransition { get; set; } = Default.StateTransition;

			/// <summary>
			/// Naming Replacement : $0 : Default: "OT"
			/// </summary>
			public string NameShorthandObjType { get; set; } = Shorthand.ObjType;

			/// <summary>
			/// Naming Replacement : $0 : Default: "OC"
			/// </summary>
			public string NameShorthandObjectClass { get; set; } = Shorthand.ObjectClass;

			/// <summary>
			/// Naming Replacement : $0 : Default: "PD"
			/// </summary>
			public string NameShorthandPropertyDef { get; set; } = Shorthand.PropertyDef;

			/// <summary>
			/// Naming Replacement : $0 : Default: "WF"
			/// </summary>
			public string NameShorthandWorkflow { get; set; } = Shorthand.Workflow;

			/// <summary>
			/// Naming Replacement : $0 : Default: "WFS"
			/// </summary>
			public string NameShorthandState { get; set; } = Shorthand.State;

			/// <summary>
			/// Naming Replacement : $0 : Default: "WFST"
			/// </summary>
			public string NameShorthandStateTransition { get; set; } = Shorthand.StateTransition;

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

		/// <summary>
		/// Alias : Clear Operations.
		/// </summary>
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

			/// <summary>
			/// Vault reference.
			/// </summary>
			private Vault  Vault { get; set; }

			/// <summary>
			/// Alias Settings
			/// </summary>
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
				StateTransition stateTransition = Resolve.stateTransitionById( this.Vault, id, out wfAdmin );

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
				StateAdmin state = Resolve.stateById( this.Vault, id, out wfAdmin );

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
				WorkflowAdmin workflow = Resolve.workflowById( this.Vault, id );

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
				PropertyDefAdmin propDefAdmin = Resolve.propertyDefById( this.Vault, id );
				
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

		/// <summary>
		/// Alias : Add|Append Operations.
		/// </summary>
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

			/// <summary>
			/// Vault Reference.
			/// </summary>
			private Vault Vault { get; set; }

			/// <summary>
			/// Alias Settings.
			/// </summary>
			private Settings settings { get; set; }

			public void ValueListAlias(int id, string alias)
			{
				throw new NotImplementedException();
			}

			public void ValueListAliases(int id, string[] aliases)
			{
				throw new NotImplementedException();
			}

			/// <summary>
			/// Appends the alias to the workflow state transition object.
			/// </summary>
			/// <param name="alias">Alias to append.</param>
			/// <param name="wfa">Owner <see cref="StateTransition"/></param>
			/// <param name="transitionId">State Transition ID</param>
			public void StateTransitionAlias(string alias, WorkflowAdmin wfa, int transitionId)
			{
				// Resolve the State Admin object by id, from the workflow.
				StateAdmin state = wfa.States.Cast<StateAdmin>().SingleOrDefault(x => x.ID == transitionId);

				// Add the alias only if it does not already exist.
				if (!AliasExists(MFMetadataStructureItem.MFMetadataStructureItemState, alias))
				{
					// Append a delimiter if needed.
					if (state != null)
					{
						// Should the delimiter be added?
						if( !state.SemanticAliases.Value.Trim().EndsWith(";") )
							state.SemanticAliases.Value += ';';

						// Append the alias.
						state.SemanticAliases.Value += alias;
					}
				}
			}

			/// <summary>
			/// Appends the alias to the workflow state transition object.
			/// </summary>
			/// <param name="id">State Transition ID</param>
			/// <param name="alias">Alias to append.</param>
			public void StateTransitionAlias(int id, string alias)
			{
				// Resolve the workflow state's owner.
				ValueListItem stateVli = this.Vault.ValueListItemOperations.GetValueListItemByID((int) MFBuiltInValueList.MFBuiltInValueListStates, id);

				// Resolve the states owner.
				WorkflowAdmin wfa = this.Vault.WorkflowOperations.GetWorkflowAdmin(stateVli.OwnerID);
				StateAlias(alias, wfa, id);
			}

			/// <summary>
			/// Appends the aliases to the workflow state transition object.
			/// </summary>
			/// <param name="id">State Transition ID.</param>
			/// <param name="aliases">Aliases to add.</param>
			public void StateTransitionAliases(int id, string[] aliases)
			{
				// Add each alias.
				foreach (string alias in aliases)
					StateTransitionAlias(id, alias);
			}

			/// <summary>
			/// Appends the alias to the workflow state object.
			/// </summary>
			/// <param name="alias"></param>
			/// <param name="wfa">Owner <see cref="WorkflowAdmin"/></param>
			/// <param name="stateId">State ID</param>
			public void StateAlias(string alias, WorkflowAdmin wfa, int stateId)
			{
				// Resolve the State Admin object by id, from the workflow.
				StateAdmin state = wfa.States.Cast<StateAdmin>().SingleOrDefault(x => x.ID == stateId);

				// Add the alias only if it does not already exist.
				if (!AliasExists(MFMetadataStructureItem.MFMetadataStructureItemState, alias))
				{
					// Append a delimiter if needed.
					if (state != null)
					{
						// Should the delimiter be added?
						if( !state.SemanticAliases.Value.Trim().EndsWith(";") )
							state.SemanticAliases.Value += ';';

						// Append the alias.
						state.SemanticAliases.Value += alias;
					}
				}
			}

			/// <summary>
			/// Appends the alias to the workflow state object.
			/// </summary>
			/// <param name="id">State ID</param>
			/// <param name="alias">Alias to append.</param>
			public void StateAlias(int id, string alias)
			{
				// Resolve the workflow state's owner.
				ValueListItem stateVli = this.Vault.ValueListItemOperations.GetValueListItemByID((int) MFBuiltInValueList.MFBuiltInValueListStates, id);

				// Resolve the states owner.
				WorkflowAdmin wfa = this.Vault.WorkflowOperations.GetWorkflowAdmin(stateVli.OwnerID);
				StateAlias(alias, wfa, id);
			}

			/// <summary>
			/// Appends the aliases to the workflow state object.
			/// </summary>
			/// <param name="id">State ID.</param>
			/// <param name="aliases">Aliases to add.</param>
			public void StateAliases(int id, string[] aliases)
			{
				// Add each alias.
				foreach (string alias in aliases)
					StateAlias(id, alias);
			}

			/// <summary>
			/// Appends the alias to the workflow object.
			/// </summary>
			/// <param name="alias">Alias to append.</param>
			/// <param name="wfa"><see cref="WorkflowAdmin"/></param>
			public void WorkflowAlias(string alias, WorkflowAdmin wfa)
			{
				// Add the alias only if it does not already exist.
				if (!AliasExists(MFMetadataStructureItem.MFMetadataStructureItemWorkflow, alias))
				{
					// Append a delimiter if needed.
					if (!wfa.SemanticAliases.Value.Trim().EndsWith(";"))
						wfa.SemanticAliases.Value += ';';

					// Append the alias.
					wfa.SemanticAliases.Value += alias;
				}
			}

			/// <summary>
			/// Appends the alias to the workflow object.
			/// </summary>
			/// <param name="id">Workflow ID</param>
			/// <param name="alias">Alias to append.</param>
			public void WorkflowAlias(int id, string alias)
			{
				// Resolve the API Structure Object.
				WorkflowAlias(alias, this.Vault.WorkflowOperations.GetWorkflowAdmin(id));
			}

			/// <summary>
			/// Appends the alias to the workflow object.
			/// </summary>
			/// <param name="id">Workflow ID</param>
			/// <param name="aliases">Aliases to append.</param>
			public void WorkflowAliases(int id, string[] aliases)
			{
				// Resolve the API Structure Object.
				WorkflowAdmin wfa = this.Vault.WorkflowOperations.GetWorkflowAdmin(id);

				// Add each alias.
				foreach (string alias in aliases)
					WorkflowAlias(alias, wfa);
			}

			/// <summary>
			/// Appends the alias to the object class.
			/// </summary>
			/// <param name="alias">Alias to append.</param>
			/// <param name="propertyDefAdmin"><see cref="PropertyDefAdmin"/></param>
			public void PropertyAlias(string alias, PropertyDefAdmin propertyDefAdmin )
			{
				// Add the alias only if it does not already exist.
				if (!AliasExists(MFMetadataStructureItem.MFMetadataStructureItemPropertyDef, alias))
				{
					// Append a delimiter if needed.
					if (!propertyDefAdmin.SemanticAliases.Value.Trim().EndsWith(";"))
						propertyDefAdmin.SemanticAliases.Value += ';';

					// Append the alias.
					propertyDefAdmin.SemanticAliases.Value += alias;
				}
			}

			/// <summary>
			/// Appends the alias to the PropertyDef.
			/// </summary>
			/// <param name="id">Property ID</param>
			/// <param name="aliases">Alias to append.</param>
			public void PropertyAliases(int id, string[] aliases)
			{
				// Resolve the API Structure Object.
				PropertyDefAdmin pda = this.Vault.PropertyDefOperations.GetPropertyDefAdmin(id);

				// Add each alias.
				foreach (string alias in aliases)
					PropertyAlias(alias, pda);
			}

			/// <summary>
			/// Appends the alias to the object class.
			/// </summary>
			/// <param name="oca"><see cref="ObjectClass"/></param>
			/// <param name="alias">Alias to append.</param>
			public void ClassAlias(string alias, ObjectClassAdmin oca)
			{
				// Add the alias only if it does not already exist.
				if (!AliasExists(MFMetadataStructureItem.MFMetadataStructureItemClass, alias))
				{
					// Append a delimiter if needed.
					if (!oca.SemanticAliases.Value.Trim().EndsWith(";"))
						oca.SemanticAliases.Value += ';';

					// Append the alias.
					oca.SemanticAliases.Value += alias;
				}
			}

			/// <summary>
			/// Appends the alias to the object class with the provided id.
			/// </summary>
			/// <param name="id">Class ID</param>
			/// <param name="alias">Alias to append.</param>
			public void ClassAlias(int id, string alias)
			{
				// Resolve the API Structure Object.
				ObjectClassAdmin objectClass = this.Vault.ClassOperations.GetObjectClassAdmin(id);
				ClassAlias(alias, objectClass);
			}

			/// <summary>
			/// Appends an object alias to the object class.
			/// </summary>
			/// <param name="id">Class ID</param>
			/// <param name="aliases">Aliases to append.</param>
			public void ClassAliases(int id, string[] aliases)
			{
				// Resolve the API Structure Object.
				ObjectClassAdmin objectClass = this.Vault.ClassOperations.GetObjectClassAdmin(id);

				// Add each alias.
				foreach (string alias in aliases)
					ClassAlias(alias, objectClass);
			}

			/// <summary>
			/// Appends an object alias to the object type.
			/// </summary>
			/// <param name="alias">Alias to append.</param>
			/// <param name="objTypeAdmin"><see cref="ObjTypeAdmin"/></param>
			public void ObjTypeAlias(string alias, ObjTypeAdmin objTypeAdmin)
			{

				// Add the alias only if it does not already exist.
				if (!AliasExists(MFMetadataStructureItem.MFMetadataStructureItemObjectType, alias))
				{
					// Append a delimiter if needed.
					if (!objTypeAdmin.SemanticAliases.Value.Trim().EndsWith(";"))
						objTypeAdmin.SemanticAliases.Value += ';';

					// Append the alias.
					objTypeAdmin.SemanticAliases.Value += alias;
				}
			}

			/// <summary>
			/// Appends the given aliases to the object type.
			/// </summary>
			/// <param name="id">Object ID</param>
			/// <param name="aliases">Aliases to append</param>
			public void ObjTypeAliases(int id, string[] aliases)
			{
				// Resolve the API Structure Object.
				ObjTypeAdmin objTypeAdmin = this.Vault.ObjectTypeOperations.GetObjectTypeAdmin(id);

				// Add each alias.
				foreach (string alias in aliases)
					ObjTypeAlias(alias, objTypeAdmin);
			}

			/// <summary>
			/// Auto aliases an object type, by id.
			/// </summary>
			/// <param name="id"></param>
			public void AutoAliasObjType(int id)
			{
				// Resolve the API Structure Object.
				this.AutoAliasObjType(this.Vault.ObjectTypeOperations.GetObjectTypeAdmin(id));
			}

			/// <summary>
			/// Auto aliases an object type, by id.
			/// </summary>
			/// <param name="objTypeAdmin"><see cref="ObjTypeAdmin"/></param>
			public void AutoAliasObjType(ObjTypeAdmin objTypeAdmin )
			{
				string alias = FormatAlias(objTypeAdmin, this.settings);
				ObjTypeAlias(alias, objTypeAdmin);
			}

			/// <summary>
			/// Auto aliases all object types.
			/// </summary>
			public void AutoAliasObjTypes()
			{
				foreach (ObjTypeAdmin ota in this.Vault.ObjectTypeOperations.GetObjectTypesAdmin())
					AutoAliasObjType(ota);
			}
		}

		/// <summary>
		/// Alias : Remove Operations.
		/// </summary>
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
				StateTransition stateTransition = Resolve.stateTransitionById( this.Vault, id, out wfAdmin );

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
				StateAdmin state = Resolve.stateById( this.Vault, id, out wfAdmin );

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
				WorkflowAdmin wfAdmin = Resolve.workflowById( this.Vault, id );

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
				PropertyDefAdmin pda = Resolve.propertyDefById( this.Vault, id );

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
				ObjectClassAdmin objClass = Resolve.classById( this.Vault, id );

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
				ObjTypeAdmin ota = Resolve.objTypeById(this.Vault, id);

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
		/// Determines if an alias already exists in the vault.
		/// </summary>
		/// <param name="type"><see cref="MFMetadataStructureItem"/> Type to check.</param>
		/// <param name="alias">Alias to look for.</param>
		/// <returns>True when the alias already exists in a vault.</returns>
		internal static bool AliasExists( MFMetadataStructureItem type, string alias )
		{
			throw new NotImplementedException();
		}

		/// <summary>
		/// Formats an alias using the given settings.
		/// </summary>
		/// <param name="apiObj">Boxed API Admin Object</param>
		/// <param name="settings">Alias settings.</param>
		/// <returns>Alias string formatted according to the specified settings.</returns>
		internal static string FormatAlias(object apiObj, AliasTools.Settings settings )
		{
			// {0} = TYPE
			string zero = null;

			// {1} = NAME
			string one = null;

			// {2} = NAME PLURAL
			string two = string.Empty;

			// Set the placeholder values needed for the string formatting.
			if ( apiObj is ObjTypeAdmin )
			{
				one = (apiObj as ObjTypeAdmin).ObjectType.NameSingular;
				two = (apiObj as ObjTypeAdmin).ObjectType.NamePlural;
				zero = settings.UseShorthand
					? settings.NameShorthandObjType
					: settings.NameObjType;
			}
			else if ( apiObj is ObjectClassAdmin )
			{
				one = (apiObj as ObjectClassAdmin).Name;
				zero = settings.UseShorthand
					? settings.NameShorthandObjectClass
					: settings.NameObjectClass;
			}
			else if ( apiObj is PropertyDefAdmin )
			{
				one = (apiObj as PropertyDefAdmin).PropertyDef.Name;
				zero = settings.UseShorthand
					? settings.NameShorthandPropertyDef
					: settings.NamePropertyDef;
			}
			else if ( apiObj is WorkflowAdmin )
			{
				one = (apiObj as WorkflowAdmin).Workflow.Name;
				zero = settings.UseShorthand
					? settings.NameShorthandWorkflow
					: settings.NameWorkflow;
			}
			else if ( apiObj is StateAdmin )
			{
				one = (apiObj as StateAdmin).Name;
				zero = settings.UseShorthand
					? settings.NameShorthandState
					: settings.NameState;
			}
			else if ( apiObj is StateTransition )
			{
				one = (apiObj as StateTransition).Name;
				zero = settings.UseShorthand
					? settings.NameShorthandStateTransition
					: settings.NameStateTransition;
			}

			// Format the alias, using the mask and the placeholders.
			string formattedAlias = string.Format(settings.AliasMask, zero, one, two);

			// Return the formatted alias.
			return formattedAlias;
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


		/// <summary>
		/// Vault Reference.
		/// </summary>
		public Vault Vault { get; set; }


		/// <summary>
		/// Alias Settings.
		/// </summary>
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
