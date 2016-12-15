using System;
using MFilesAPI;
using Newtonsoft.Json;

namespace MFToolbox.Core
{
	public static class _
	{
		/// <summary>
		/// Determines if an alias already exists in the vault.
		/// </summary>
		/// <param name="v"><see cref="Vault"/> reference</param>
		/// <param name="type"><see cref="MFMetadataStructureItem"/> Type to check.</param>
		/// <param name="alias">Alias to look for.</param>
		/// <returns>True when the alias already exists in a vault.</returns>
		public static bool AliasExists( this Vault v, MFMetadataStructureItem type, string alias)
		{
			switch (type)
			{
				case MFMetadataStructureItem.MFMetadataStructureItemObjectType:
					return v.ObjectTypeOperations.GetObjectTypeIDByAlias(alias) != -1;
				case MFMetadataStructureItem.MFMetadataStructureItemPropertyDef:
					return v.PropertyDefOperations.GetPropertyDefIDByAlias(alias) != -1;
				case MFMetadataStructureItem.MFMetadataStructureItemClass:
					return v.ClassOperations.GetObjectClassIDByAlias(alias) != -1;
				case MFMetadataStructureItem.MFMetadataStructureItemWorkflow:
					return v.WorkflowOperations.GetWorkflowIDByAlias(alias) != -1;
				case MFMetadataStructureItem.MFMetadataStructureItemState:
					return v.WorkflowOperations.GetWorkflowStateIDByAlias(alias) != -1;
				case MFMetadataStructureItem.MFMetadataStructureItemNamedACL:
					return v.NamedACLOperations.GetNamedACLIDByAlias(alias) != -1;
				case MFMetadataStructureItem.MFMetadataStructureItemUserGroup:
					return v.UserGroupOperations.GetUserGroupIDByAlias(alias) != -1;
				case MFMetadataStructureItem.MFMetadataStructureItemValueList:
					return v.ValueListOperations.GetValueListIDByAlias(alias) != -1;
				case MFMetadataStructureItem.MFMetadataStructureItemStateTransition:
					return v.WorkflowOperations.GetWorkflowStateTransitionIDByAlias(alias) != -1;
				default:
					throw new ArgumentOutOfRangeException(nameof(type), type, null);
			}
		}

		/// <summary>
		/// Universal ToJson extension method.
		/// </summary>
		/// <typeparam name="T">Class Type</typeparam>
		/// <param name="obj">Object Instance</param>
		/// <returns>Json string</returns>
		public static string ToJson<T>(this object obj) where T : class
		{
			return JsonConvert.SerializeObject( obj as T );
		}
	}
}
