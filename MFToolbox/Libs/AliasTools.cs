using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using MFilesAPI;
using MFToolbox.Core;

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
				// ReSharper disable once InconsistentNaming - On Purpose to demonstrate the snake_case convention.
				Snake_Case = 2
			}

			/// <summary>
			/// Template String used like the String.Format(); method in C#.
			/// Replacement for {0} is the type: ObjType|ObjectClass|PropertyDef|ValueList|Workflow|State|StateTransition.
			/// Replacement for {1} is the Name | Name Singular.
			/// For ObjTypes {2} is the Name Plural.
			/// 
			/// Example: Using Defaults, shown using 'Document' property.
			/// Default: ObjType - M-Files.{0}.{1} => M-Files.ObjType.Document
			/// Shorthand: ObjType - MF.{0}.{1} => MF.OT.Document
			/// 
			/// Default Plural: ObjType - M-Files.{0}.{2} => M-Files.ObjType.Documents
			/// Shorthand Plural: ObjType - MF.{0}.{2} => MF.OT.Documents
			/// 
			/// Default: PropertyDef - M-Files.{0}.{1} => M-Files.Property.Document
			/// Shorthand: PropertyDef - MF.{0}.{1} => MF.PD.Document
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

			private string formatCase(string str)
			{
				if (this.TitleCase)
					return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(str);

				return str;
			}

			private string formatSpaces(string str)
			{
				switch (this.SpaceHandler)
				{
					case SpaceHandling.None:
						return str;
					case SpaceHandling.Remove:
						return str.Replace(" ", string.Empty);
					case SpaceHandling.Snake_Case:
						return str.Replace(" ", "_");
					default:
						throw new ArgumentOutOfRangeException();
				}
			}

			/// <summary>
			/// Self initializing constructor.
			/// </summary>
			/// <param name="aliasMask">Template String used like the String.Format(); method in c#.</param>
			/// <param name="titleCase">Should the Name be converted to Title Case?</param>
			/// <param name="autoNumberDuplicates">When true duplicate aliases are auto numbered.</param>
			/// <param name="preserveCustomAliases">When true, any alias not matching the given mask will be ignored</param>
			/// <param name="useShorthand">When true, the shorthand syntax is used</param>
			/// <param name="spaceHandler"> How should spaces be handled?</param>
			public Settings( string aliasMask = "{0}.{1}", bool titleCase = true, bool autoNumberDuplicates = true, bool preserveCustomAliases = true, bool useShorthand = false, SpaceHandling spaceHandler = SpaceHandling.Snake_Case )
			{
				AliasMask = aliasMask;
				AutoNumberDuplicates = autoNumberDuplicates;
				PreserveCustomAliases = preserveCustomAliases;
				SpaceHandler = spaceHandler;
				TitleCase = titleCase;
				UseShorthand = useShorthand;
			}

			public string FormatAlias(dynamic apiObj, WorkflowAdmin wfa)
			{

				string format;
				if (apiObj is StateTransition)
				{
					format = FormatAlias(wfa) + ".{0}";

					var one =
						$"{wfa.States.Cast<StateAdmin>().Single(s => s.ID == (int) apiObj.FromState).Name}=>{wfa.States.Cast<StateAdmin>().Single(s => s.ID == (int) apiObj.ToState).Name}";

					return format = string.Format(format, formatSpaces(formatCase(one)));
				}

				format = FormatAlias(wfa) + ".{1}";

				return FormatAlias(apiObj, format);
			}


			/// <summary>
			/// Formats an alias using the given settings.
			/// </summary>
			/// <param name="apiObj">Boxed API Admin Object</param>
			/// <param name="maskOverride">When passed, the class <see cref="AliasMask"/> is overridden.</param>
			/// <returns>Alias string formatted according to the specified settings.</returns>
			public string FormatAlias(dynamic apiObj, string maskOverride = null)
			{
				// {0} = TYPE
				string zero = null;

				// {1} = NAME
				string one = null;

				// {2} = NAME PLURAL
				string two = string.Empty;

				// Set the placeholder values needed for the string formatting.
				if (apiObj is ObjTypeAdmin)
				{
					one = apiObj.ObjectType.NameSingular;
					two = apiObj.ObjectType.NamePlural;
					zero = this.UseShorthand
						? this.NameShorthandObjType
						: this.NameObjType;
				}
				else if (apiObj is ObjectClassAdmin)
				{
					one = apiObj.Name;
					zero = this.UseShorthand
						? this.NameShorthandObjectClass
						: this.NameObjectClass;
				}
				else if (apiObj is PropertyDefAdmin)
				{
					one = apiObj.PropertyDef.Name;
					zero = this.UseShorthand
						? this.NameShorthandPropertyDef
						: this.NamePropertyDef;
				}
				else if (apiObj is WorkflowAdmin)
				{
					one = apiObj.Workflow.Name;
					zero = this.UseShorthand
						? this.NameShorthandWorkflow
						: this.NameWorkflow;
				}
				else if (apiObj is StateAdmin)
				{
					one = apiObj.Name;
					zero = this.UseShorthand
						? this.NameShorthandState
						: this.NameState;
				}

				// Update the Casing for the item name.
				one = formatCase(one);
				two = formatCase(two);

				// Format the alias, using the mask and the placeholders.
				string formattedAlias = formatSpaces(string.Format(maskOverride ?? this.AliasMask, zero, one, two));

				// Return the formatted alias.
				return formattedAlias;
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
				StateTransition stateTransition = this.Vault.StateTransitionById(id, out wfAdmin );

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
				StateAdmin state = this.Vault.StateById(id, out wfAdmin );

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
				WorkflowAdmin workflow = this.Vault.WorkflowById(id );

				// Clear the Aliases.
				workflow.SemanticAliases.Value = string.Empty;

				// Save changes.
				this.Vault.WorkflowOperations.UpdateWorkflowAdmin( workflow );
			}

			/// <summary>
			/// Clears the Aliases on the <see cref="PropertyDef"/> with the provided id.
			/// </summary>
			/// <param name="propDefAdmin">Pre-resolved PropertyDef Admin</param>
			public void PropertyAlias(PropertyDefAdmin propDefAdmin )
			{
				// Clear the aliases.
				propDefAdmin.SemanticAliases.Value = string.Empty;

				// Save changes.
				this.Vault.PropertyDefOperations.UpdatePropertyDefAdmin( propDefAdmin );
			}

			/// <summary>
			/// Clears the Aliases on the <see cref="PropertyDef"/> with the provided id.
			/// </summary>
			/// <param name="id">PropertyDef ID</param>
			public void PropertyAlias(int id)
			{
				// Get the PropertyDefAdmin with using the provided id.
				PropertyDefAdmin propDefAdmin = this.Vault.PropertyDefById(id );
				PropertyAlias(propDefAdmin);
			}

			/// <summary>
			/// Clears the aliases on the <see cref="ObjectClass"/>with the provided id.
			/// </summary>
			/// <param name="classAdmin">Pre-resolved <see cref="ObjectClass"/></param>
			public void ClassAlias(ObjectClassAdmin classAdmin)
			{
				// Clear the aliases.
				classAdmin.SemanticAliases.Value = string.Empty;

				// Save changes.
				this.Vault.ClassOperations.UpdateObjectClassAdmin( classAdmin );
			}

			/// <summary>
			/// Clears the aliases on the <see cref="ObjectClass"/>with the provided id.
			/// </summary>
			/// <param name="id"><see cref="ObjectClass"/> ID</param>
			public void ClassAlias(int id)
			{
				// Get the Class Admin with the provided id.
				ObjectClassAdmin classAdmin = this.Vault.ClassOperations.GetObjectClassAdmin( id );
				ClassAlias(classAdmin);
			}

			/// <summary>
			/// Clears the aliases on the <see cref="ObjType"/> with the provided id.
			/// </summary>
			/// <param name="objAdmin">Pre-resolved <see cref="ObjTypeAdmin"/></param>
			public void ObjTypeAlias(ObjTypeAdmin objAdmin)
			{
				// Clear the aliases.
				objAdmin.SemanticAliases.Value = string.Empty;

				// Save changes.
				this.Vault.ObjectTypeOperations.UpdateObjectTypeAdmin( objAdmin );
			}

			/// <summary>
			/// Clears the aliases on the <see cref="ObjType"/> with the provided id.
			/// </summary>
			/// <param name="id">Object ID</param>
			public void ObjTypeAlias(int id)
			{
				// Get the ObjType Admin using the provided id.
				ObjTypeAdmin objAdmin = this.Vault.ObjectTypeOperations.GetObjectTypeAdmin( id );

				ObjTypeAlias(objAdmin);
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

			#region Property

			/// <summary>
			/// Appends the alias to the object class.
			/// </summary>
			/// <param name="alias">Alias to append.</param>
			/// <param name="propertyDefAdmin"><see cref="PropertyDefAdmin"/></param>
			public void PropertyAlias(string alias, PropertyDefAdmin propertyDefAdmin )
			{
				// Add the alias only if it does not already exist.
				if (!this.Vault.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemPropertyDef, alias))
				{
					// Append a delimiter if needed.
					if (!propertyDefAdmin.SemanticAliases.Value.Trim().EndsWith(";"))
						propertyDefAdmin.SemanticAliases.Value += ';';

					// Append the alias.
					propertyDefAdmin.SemanticAliases.Value += alias;

					// Persist the change.
					this.Vault.PropertyDefOperations.UpdatePropertyDefAdmin(propertyDefAdmin);
				}
			}

			/// <summary>
			/// Appends the alias to the PropertyDef.
			/// </summary>
			/// <param name="id">Property ID</param>
			/// <param name="alias">Alias to append.</param>
			public void PropertyAlias(int id, string alias)
			{
				// Resolve the API Structure Object.
				PropertyDefAdmin pda = this.Vault.PropertyDefOperations.GetPropertyDefAdmin(id);
				PropertyAlias(alias, pda);
			}

			/// <summary>
			/// Appends the aliases to the PropertyDef.
			/// </summary>
			/// <param name="id">Property ID</param>
			/// <param name="aliases">Aliases to append.</param>
			public void PropertyAliases(int id, string[] aliases)
			{
				// Resolve the API Structure Object.
				PropertyDefAdmin pda = this.Vault.PropertyDefOperations.GetPropertyDefAdmin(id);

				// Add each alias.
				foreach (string alias in aliases)
					PropertyAlias(alias, pda);
			}

			#endregion

			#region Class

			/// <summary>
			/// Appends the alias to the object class.
			/// </summary>
			/// <param name="oca"><see cref="ObjectClass"/></param>
			/// <param name="alias">Alias to append.</param>
			public void ClassAlias(string alias, ObjectClassAdmin oca)
			{
				// Add the alias only if it does not already exist.
				if (!this.Vault.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemClass, alias))
				{
					// Append a delimiter if needed.
					if (oca.SemanticAliases.Value.Length > 1 && !oca.SemanticAliases.Value.Trim().EndsWith(";"))
						oca.SemanticAliases.Value += ';';

					// Append the alias.
					oca.SemanticAliases.Value += alias;

					// Persist the change.
					this.Vault.ClassOperations.UpdateObjectClassAdmin(oca);
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
				foreach (string alias in aliases)
					ClassAlias(alias, objectClass);
			}

			#endregion

			#region ObjType

			/// <summary>
			/// Appends an object alias to the object type.
			/// </summary>
			/// <param name="alias">Alias to append.</param>
			/// <param name="objTypeAdmin"><see cref="ObjTypeAdmin"/></param>
			public void ObjTypeAlias(string alias, ObjTypeAdmin objTypeAdmin)
			{

				// Add the alias only if it does not already exist.
				if (!this.Vault.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemObjectType, alias))
				{
					// Append a delimiter if needed.
					if (objTypeAdmin.SemanticAliases.Value.Length > 1 && !objTypeAdmin.SemanticAliases.Value.Trim().EndsWith(";"))
						objTypeAdmin.SemanticAliases.Value += ';';

					// Append the alias.
					objTypeAdmin.SemanticAliases.Value += alias;

					// Persist the change.
					this.Vault.ObjectTypeOperations.UpdateObjectTypeAdmin(objTypeAdmin);
				}
			}

			/// <summary>
			/// Appends the alias to the object type with the provided id.
			/// </summary>
			/// <param name="id">ObjType ID</param>
			/// <param name="alias">Alias to append.</param>
			public void ObjTypeAlias(int id, string alias)
			{
				// Resolve the API Structure Object.
				ObjTypeAdmin objTypeAdmin = this.Vault.ObjectTypeOperations.GetObjectTypeAdmin(id);
				ObjTypeAlias(alias, objTypeAdmin);
			}

			/// <summary>
			/// Appends the given aliases to the object type.
			/// </summary>
			/// <param name="id">Object ID</param>
			/// <param name="aliases">Aliases to append</param>
			public void ObjTypeAliases(int id, string[] aliases)
			{
				// Add each alias.
				ObjTypeAdmin objTypeAdmin = this.Vault.ObjectTypeOperations.GetObjectTypeAdmin(id);
				foreach (string alias in aliases)
					ObjTypeAlias(alias, objTypeAdmin);
			}

			#endregion

			#region Workflow

			/// <summary>
			/// Appends the alias to the workflow object.
			/// </summary>
			/// <param name="alias">Alias to append.</param>
			/// <param name="wfa"><see cref="WorkflowAdmin"/></param>
			public void WorkflowAlias(string alias, WorkflowAdmin wfa)
			{
				// Add the alias only if it does not already exist.
				if (!this.Vault.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemWorkflow, alias))
				{
					// Append a delimiter if needed.
					if (!wfa.SemanticAliases.Value.Trim().EndsWith(";"))
						wfa.SemanticAliases.Value += ';';

					// Append the alias.
					wfa.SemanticAliases.Value += alias;

					// Persist the change.
					this.Vault.WorkflowOperations.UpdateWorkflowAdmin(wfa);
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

			#endregion

			#region State

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
				if (!this.Vault.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemState, alias))
				{
					// Append a delimiter if needed.
					if (state != null)
					{
						// Should the delimiter be added?
						if( !state.SemanticAliases.Value.Trim().EndsWith(";") )
							state.SemanticAliases.Value += ';';

						// Append the alias.
						state.SemanticAliases.Value += alias;

						// Persist the change.
						this.Vault.WorkflowOperations.UpdateWorkflowAdmin(wfa);
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

			#endregion

			#region State Transitions
			
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
				if (!this.Vault.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemState, alias))
				{
					// Append a delimiter if needed.
					if (state != null)
					{
						// Should the delimiter be added?
						if( !state.SemanticAliases.Value.Trim().EndsWith(";") )
							state.SemanticAliases.Value += ';';

						// Append the alias.
						state.SemanticAliases.Value += alias;

						// Persist the change.
						this.Vault.WorkflowOperations.UpdateWorkflowAdmin(wfa);
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
				// Resolve the workflow state's owner.
				ValueListItem stateVli = this.Vault.ValueListItemOperations.GetValueListItemByID((int)MFBuiltInValueList.MFBuiltInValueListStates, id);

				// Resolve the states owner.
				WorkflowAdmin wfa = this.Vault.WorkflowOperations.GetWorkflowAdmin(stateVli.OwnerID);

				// Add each alias.
				foreach (string alias in aliases)
					StateTransitionAlias(alias, wfa, id);
			}

			#endregion

			#region Auto Aliasing

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
				string alias = this.settings.FormatAlias(objTypeAdmin);
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

			#endregion

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
						aliases.Value = string.Join("; ", results);
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
				StateTransition stateTransition = this.Vault.StateTransitionById(id, out wfAdmin );

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
				StateAdmin state = this.Vault.StateById(id, out wfAdmin );

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
				WorkflowAdmin wfAdmin = this.Vault.WorkflowById(id );

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
			/// <param name="alias">Alias to remove.</param>
			/// <param name="pda">Pre-resolved <see cref="PropertyDefAdmin"/></param>
			public void PropertyAlias(string alias, PropertyDefAdmin pda)
			{
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
			/// <param name="alias">Alias to remove.</param>
			public void PropertyAlias(int id, string alias)
			{
				// Resolve the PropertyDef.
				PropertyDefAdmin pda = this.Vault.PropertyDefById(id );
				PropertyAlias(alias, pda);
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
			/// <param name="alias">Alias to remove.</param>
			/// <param name="objClass">Pre-resolved Object Class</param>
			public void ClassAlias(string alias, ObjectClassAdmin objClass)
			{
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
			/// <param name="alias">Alias to remove.</param>
			public void ClassAlias(int id, string alias)
			{
				// Resolve the ObjectClass Admin.
				ObjectClassAdmin objClass = this.Vault.ClassById(id );
				ClassAlias(alias, objClass);
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
			/// <param name="alias">Alias to remove.</param>
			/// <param name="ota">Pre-resolved <see cref="ObjTypeAdmin"/></param>
			public void ObjTypeAlias(string alias, ObjTypeAdmin ota)
			{
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
			/// <param name="alias">Alias to remove.</param>
			public void ObjTypeAlias(int id, string alias)
			{
				// Resolve the ObjTypeAdmin
				ObjTypeAdmin ota = this.Vault.ObjTypeById(id);
				ObjTypeAlias(alias, ota);
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
