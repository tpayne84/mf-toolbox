using System;
using System.Linq;
using MFilesAPI;
using MFToolbox.Core;
using MFToolbox.Libs;
using NUnit.Framework;

namespace MFToolboxTests
{
	/// <summary>
	/// MFToolbox.Libs.AliasTools Tests.
	/// </summary>
	[TestFixture]
	[MFVaultConnection( 
		AuthType = MFAuthType.MFAuthTypeSpecificMFilesUser,
		UserName = ConnectionInfo.TestUser,
		Password= ConnectionInfo.TestPassword,
		NetworkAddress = ConnectionInfo.VMAddress, 
		VaultGuid= ConnectionInfo.VaultGuid
	)]
	public class AliasLibTests : IDisposable
	{
		/// <summary>
		/// M-Files Server Application.
		/// </summary>
		private MFilesServerApplication ServerApp { get; set; }

		/// <summary>
		/// Vault Object.
		/// </summary>
		private Vault V { get; set; }

		/// <summary>
		/// Alias Tools instance.
		/// </summary>
		private AliasTools Tools { get; set; }

		/// <summary>
		/// Alias Tools settings.
		/// </summary>
		private AliasTools.Settings Settings { get; set; }

		/// <summary>
		/// Test setup method.
		/// </summary>
		[SetUp]
		public void Init()
		{
			ServerApp = new MFilesServerApplication();

			Vault v;
			MFVaultConnectionAttribute vaultConnInfo = ServerApp.Connect(GetType(), out v);
			this.V = v;
			this.Tools = new AliasTools(this.V);
			this.Settings = new AliasTools.Settings();
		}

		/// <summary>
		/// Test tear down method.
		/// </summary>
		[TearDown]
		public void Dispose()
		{ /* ... */ }

		#region Format Tests

		[Test]
		public void Test_001_DefaultObjTypeFormating()
		{
			ObjTypeAdmin objType = this.V.ObjectTypeOperations.GetObjectTypeAdmin((int)MFBuiltInObjectType.MFBuiltInObjectTypeDocument);
			Assert.AreEqual("ObjType.Document", this.Settings.FormatAlias(objType));
		}

		[Test]
		public void Test_002_ShorthandObjTypeFormating()
		{
			this.Settings.UseShorthand = true;
			ObjTypeAdmin objType = this.V.ObjectTypeOperations.GetObjectTypeAdmin((int)MFBuiltInObjectType.MFBuiltInObjectTypeDocument);
			Assert.AreEqual("OT.Document", this.Settings.FormatAlias(objType));
		}

		[Test]
		public void Test_003_DefaultObjTypeFormatingPlural()
		{
			this.Settings.AliasMask = "{0}.{2}";
			this.Settings.UseShorthand = false;
			ObjTypeAdmin objType = this.V.ObjectTypeOperations.GetObjectTypeAdmin((int)MFBuiltInObjectType.MFBuiltInObjectTypeDocument);
			Assert.AreEqual("ObjType.Documents", this.Settings.FormatAlias(objType));
		}

		[Test]
		public void Test_004_ShorthandObjTypeFormatingPlural()
		{
			this.Settings.AliasMask = "{0}.{2}";
			this.Settings.UseShorthand = true;
			ObjTypeAdmin objType = this.V.ObjectTypeOperations.GetObjectTypeAdmin((int)MFBuiltInObjectType.MFBuiltInObjectTypeDocument);
			Assert.AreEqual("OT.Documents", this.Settings.FormatAlias(objType));
		}

		[Test]
		public void Test_005_DefaultClassFormating()
		{
			ObjectClassAdmin objClass = this.V.ClassOperations.GetObjectClassAdmin(0);
			Assert.AreEqual("Class.Unclassified_Document", this.Settings.FormatAlias(objClass));
		}

		[Test]
		public void Test_006_ShorthandClassFormating()
		{
			this.Settings.UseShorthand = true;
			ObjectClassAdmin objClass = this.V.ClassOperations.GetObjectClassAdmin(0);
			Assert.AreEqual("OC.Unclassified_Document", this.Settings.FormatAlias(objClass));
		}

		[Test]
		public void Test_007_DefaultPropertyDefFormating()
		{
			PropertyDefAdmin propDef = this.V.PropertyDefOperations.GetPropertyDefAdmin(0);
			Assert.AreEqual("Property.Name_Or_Title", this.Settings.FormatAlias(propDef));
		}

		[Test]
		public void Test_008_ShorthandPropertyDefFormating()
		{
			this.Settings.UseShorthand = true;
			PropertyDefAdmin propDef = this.V.PropertyDefOperations.GetPropertyDefAdmin(0);
			Assert.AreEqual("PD.Name_Or_Title", this.Settings.FormatAlias(propDef));
		}

		[Test]
		public void Test_009_DefaultWorkflowFormating()
		{
			WorkflowAdmin wfAdmin = this.V.WorkflowOperations.GetWorkflowAdmin(106);
			Assert.AreEqual("Workflow.Reviewing_Drawings", this.Settings.FormatAlias(wfAdmin));
		}

		[Test]
		public void Test_010_ShorthandWorkflowFormating()
		{
			this.Settings.UseShorthand = true;
			WorkflowAdmin wfAdmin = this.V.WorkflowOperations.GetWorkflowAdmin(106);
			Assert.AreEqual("WF.Reviewing_Drawings", this.Settings.FormatAlias(wfAdmin));
		}

		[Test]
		public void Test_011_DefaultWorkflowStateFormating()
		{
			WorkflowAdmin wfAdmin = this.V.WorkflowOperations.GetWorkflowAdmin(106);
			StateAdmin stateAdmin = wfAdmin.States.Cast<StateAdmin>().Single(s => s.ID == 135);
			Assert.AreEqual("Workflow.Reviewing_Drawings.Listed_For_Approval", this.Settings.FormatAlias(stateAdmin, wfAdmin));
		}

		[Test]
		public void Test_012_ShorthandWorkflowStateFormating()
		{
			this.Settings.UseShorthand = true;
			WorkflowAdmin wfAdmin = this.V.WorkflowOperations.GetWorkflowAdmin(106);
			StateAdmin stateAdmin = wfAdmin.States.Cast<StateAdmin>().Single(s => s.ID == 135);
			Assert.AreEqual("WF.Reviewing_Drawings.Listed_For_Approval", this.Settings.FormatAlias(stateAdmin, wfAdmin));
		}

		[Test]
		public void Test_013_DefaultWorkflowStateTransitionFormating()
		{
			WorkflowAdmin wfAdmin = this.V.WorkflowOperations.GetWorkflowAdmin(106);
			StateTransition stAdmin = wfAdmin.StateTransitions.Cast<StateTransition>().Single(st => st.ID == 2);
			Assert.AreEqual("Workflow.Reviewing_Drawings.Listed_For_Approval=>Approved", this.Settings.FormatAlias(stAdmin, wfAdmin));
		}

		[Test]
		public void Test_014_ShorthandWorkflowStateTransitionFormating()
		{
			this.Settings.UseShorthand = true;
			WorkflowAdmin wfAdmin = this.V.WorkflowOperations.GetWorkflowAdmin(106);
			StateTransition stAdmin = wfAdmin.StateTransitions.Cast<StateTransition>().Single(st => st.ID == 2);
			Assert.AreEqual("WF.Reviewing_Drawings.Listed_For_Approval=>Approved", this.Settings.FormatAlias(stAdmin, wfAdmin));
		}

		#endregion

		#region Add Alias Tests

		/// <summary>
		/// Test Helper : Adds a ObjType Alias with test assertions.
		/// </summary>
		public void AddObjTypeAlias(MFBuiltInObjectType objType, bool useShorthand = false)
			=> AddObjTypeAlias((int) objType, useShorthand);

		/// <summary>
		/// Test Helper : Adds a ObjType Alias with test assertions.
		/// </summary>
		public void AddObjTypeAlias(int objTypeId, bool useShorthand = false)
		{
			if (useShorthand)
				this.Settings.UseShorthand = true;

			// Resolve the ObjType.
			ObjTypeAdmin objType = this.V.ObjectTypeOperations.GetObjectTypeAdmin(objTypeId);

			// Format the alias to add.
			string aliasToAdd = this.Settings.FormatAlias(objType);

			// Check for the existence of the alias, removing if found.
			if (this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemObjectType, aliasToAdd))
				this.Tools.Remove.ObjTypeAlias(aliasToAdd, objType);

			// Verify that the alias does not exist.
			Assert.IsFalse(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemObjectType, aliasToAdd),
				"Verifying that alias does not exist: " + aliasToAdd);

			// Add the Alias.
			this.Tools.Add.ObjTypeAlias(aliasToAdd, objType);

			// Verify that the alias exists.
			Assert.IsTrue(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemObjectType, aliasToAdd),
				"Verifying that alias exists: " + aliasToAdd);
		}

		/// <summary>
		/// Test Helper : Adds a Class Alias with test assertions.
		/// </summary>
		public void AddClassAlias(MFBuiltInObjectClass objectClass, bool useShorthand = false)
			=> AddClassAlias((int) objectClass, useShorthand);
		
		/// <summary>
		/// Test Helper : Adds a Class Alias with test assertions.
		/// </summary>
		public void AddClassAlias(int objectClass, bool useShorthand = false)
		{
			if (useShorthand)
				this.Settings.UseShorthand = true;

			// Resolve the ClassAdmin.
			ObjectClassAdmin oca = this.V.ClassOperations.GetObjectClassAdmin(objectClass);

			// Format the alias to add.
			string aliasToAdd = this.Settings.FormatAlias(oca);

			// Check for the existence of the alias, removing if found.
			if (this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemClass, aliasToAdd))
				this.Tools.Remove.ClassAlias(aliasToAdd, oca);

			// Verify that the alias does not exist.
			Assert.IsFalse(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemClass, aliasToAdd),
				"Verifying that alias does not exist: " + aliasToAdd);

			// Add the Alias.
			this.Tools.Add.ClassAlias(aliasToAdd, oca);

			// Verify that the alias exists.
			Assert.IsTrue(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemClass, aliasToAdd),
				"Verifying that alias exists: " + aliasToAdd);
		}

		/// <summary>
		/// Test Helper : Adds a Property Alias with test assertions.
		/// </summary>
		public void AddPropertyAlias(MFBuiltInPropertyDef propDef, bool useShorthand = false)
			=> AddPropertyAlias((int) propDef, useShorthand);

		/// <summary>
		/// Test Helper : Adds a Property Alias with test assertions.
		/// </summary>
		public void AddPropertyAlias(int propDef, bool useShorthand = false)
		{
			if (useShorthand)
				this.Settings.UseShorthand = true;

			// Resolve the PropertyDef.
			PropertyDefAdmin pdAdmin = this.V.PropertyDefOperations.GetPropertyDefAdmin(propDef);

			// Format the alias to add.
			string aliasToAdd = this.Settings.FormatAlias(pdAdmin);

			// Check for the existence of the alias, removing if found.
			if (this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemPropertyDef, aliasToAdd))
				this.Tools.Remove.PropertyAlias(aliasToAdd, pdAdmin);

			// Verify that the alias does not exist.
			Assert.IsFalse(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemPropertyDef, aliasToAdd),
				"Verifying that alias does not exist: " + aliasToAdd);

			// Add the Alias.
			this.Tools.Add.PropertyAlias(aliasToAdd, pdAdmin);

			// Verify that the alias exists.
			Assert.IsTrue(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemPropertyDef, aliasToAdd),
				"Verifying that alias exists: " + aliasToAdd);
		}

		[TestCase(0, false)]
		[TestCase(0, true)]
		public void Test_015_AddObjTypeAlias(int id, bool useShorthand) => AddObjTypeAlias(id, useShorthand);

		[TestCase(0, false)]
		[TestCase(0, true)]
		public void Test_016_AddDefaultClassAlias(int id, bool useShorthand) => AddClassAlias(id, useShorthand);


		[TestCase(0, false)]
		[TestCase(0, true)]
		public void Test_017_AddDefaultPropertyDefAlias(int id, bool useShorthand) => AddPropertyAlias(id, useShorthand);

		#endregion

		#region Remove Alias Tests

		/// <summary>
		/// Test Helper : Removes a ObjType Alias with test assertions.
		/// </summary>
		public void RemoveObjTypeAlias(MFBuiltInObjectType objType, bool useShorthand = false)
			=> RemoveObjTypeAlias((int) objType, useShorthand);

		/// <summary>
		/// Test Helper : Removes a ObjType Alias with test assertions.
		/// </summary>
		public void RemoveObjTypeAlias(int objTypeId, bool useShorthand = false )
		{
			if (useShorthand)
				this.Settings.UseShorthand = true;
			
			// Resolve the ObjType.
			ObjTypeAdmin objType = this.V.ObjectTypeOperations.GetObjectTypeAdmin(objTypeId);

			// Format the alias to Remove.
			string aliasToRemove = this.Settings.FormatAlias(objType);

			// Check for the existence of the alias, removing if found.
			if (!this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemObjectType, aliasToRemove))
				this.Tools.Add.ObjTypeAlias(aliasToRemove, objType);

			// Verify that the alias exists.
			Assert.IsTrue(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemObjectType, aliasToRemove),
				"Verifying that alias exists: " + aliasToRemove);

			// Remove the Alias.
			this.Tools.Remove.ObjTypeAlias(aliasToRemove, objType);

			// Verify that the alias does not exist.
			Assert.IsFalse(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemObjectType, aliasToRemove),
				"Verifying that alias does not exist: " + aliasToRemove);

		}

		/// <summary>
		/// Test Helper : Removes a Class Alias with test assertions.
		/// </summary>
		public void RemoveClassAlias(MFBuiltInObjectClass objectClass, bool useShorthand)
			=> RemoveClassAlias((int) objectClass, useShorthand);
		
		/// <summary>
		/// Test Helper : Removes a Class Alias with test assertions.
		/// </summary>
		public void RemoveClassAlias(int objectClass, bool useShorthand = false)
		{
			if (useShorthand)
				this.Settings.UseShorthand = true;

			// Resolve the ClassAdmin.
			ObjectClassAdmin oca = this.V.ClassOperations.GetObjectClassAdmin(objectClass);

			// Format the alias to Remove.
			string aliasToRemove = this.Settings.FormatAlias(oca);

			// Check for the existence of the alias, removing if found.
			if (!this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemClass, aliasToRemove))
				this.Tools.Add.ClassAlias(aliasToRemove, oca);

			// Verify that the alias exists.
			Assert.IsTrue(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemClass, aliasToRemove),
				"Verifying that alias exists: " + aliasToRemove);

			// Remove the Alias.
			this.Tools.Remove.ClassAlias(aliasToRemove, oca);

			// Verify that the alias does not exist.
			Assert.IsFalse(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemClass, aliasToRemove),
				"Verifying that alias does not exist: " + aliasToRemove);

		}

		/// <summary>
		/// Test Helper : Removes a Property Alias with test assertions.
		/// </summary>
		public void RemovePropertyAlias(MFBuiltInPropertyDef propDef, bool useShorthand)
			=> RemovePropertyAlias((int) propDef, useShorthand);

		/// <summary>
		/// Test Helper : Removes a Property Alias with test assertions.
		/// </summary>
		public void RemovePropertyAlias(int propDef, bool useShorthand = false)
		{
			if (useShorthand)
				this.Settings.UseShorthand = true;

			// Resolve the PropertyDef.
			PropertyDefAdmin pdAdmin = this.V.PropertyDefOperations.GetPropertyDefAdmin(propDef);

			// Format the alias to Remove.
			string aliasToRemove = this.Settings.FormatAlias(pdAdmin);

			// Check for the existence of the alias, removing if found.
			if (!this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemPropertyDef, aliasToRemove))
				this.Tools.Add.PropertyAlias(aliasToRemove, pdAdmin);

			// Verify that the alias exists.
			Assert.IsTrue(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemPropertyDef, aliasToRemove),
				"Verifying that alias exists: " + aliasToRemove);

			// Remove the Alias.
			this.Tools.Remove.PropertyAlias(aliasToRemove, pdAdmin);

			// Verify that the alias does not exist.
			Assert.IsFalse(
				this.V.AliasExists(MFMetadataStructureItem.MFMetadataStructureItemPropertyDef, aliasToRemove),
				"Verifying that alias does not exist: " + aliasToRemove);
		}

		[TestCase(0, false)]
		[TestCase(0, true)]
		public void Test_018_RemoveDefaultObjTypeAlias(int id, bool useShorthand) => RemoveObjTypeAlias(id, useShorthand);

		[TestCase(0, false)]
		[TestCase(0, true)]
		public void Test_019_RemoveClassAlias(int id, bool useShorthand) => RemoveClassAlias(id, useShorthand);

		[TestCase(0, false)]
		[TestCase(0, true)]
		public void Test_020_RemovePropertyDefAlias(int id, bool useShorthand) => RemovePropertyAlias(id, useShorthand);

		#endregion

		#region Clear Alias Tests

		/// <summary>
		/// Test Helper : Clears a ObjType Alias with test assertions.
		/// </summary>
		public void ClearObjTypeAlias(MFBuiltInObjectType objType)
			=> ClearObjTypeAlias((int) objType);

		/// <summary>
		/// Test Helper : Clears a ObjType Alias with test assertions.
		/// </summary>
		public void ClearObjTypeAlias(int objTypeId)
		{
			// Resolve the ObjType.
			ObjTypeAdmin objType = this.V.ObjectTypeOperations.GetObjectTypeAdmin(objTypeId);

			// Clear the Alias.
			this.Tools.Clear.ObjTypeAlias(objType);

			// Verify that no aliases exist.
			Assert.IsTrue(
				string.IsNullOrWhiteSpace(objType.SemanticAliases.Value),
				"Verifying that no aliases exist: ");

		}

		/// <summary>
		/// Test Helper : Clears a Class Alias with test assertions.
		/// </summary>
		public void ClearClassAlias(MFBuiltInObjectClass objectClass)
			=> ClearClassAlias((int) objectClass);
		
		/// <summary>
		/// Test Helper : Clears a Class Alias with test assertions.
		/// </summary>
		public void ClearClassAlias(int objectClass)
		{

			// Resolve the ClassAdmin.
			ObjectClassAdmin oca = this.V.ClassOperations.GetObjectClassAdmin(objectClass);

			// Clear the Alias.
			this.Tools.Clear.ClassAlias(oca);

			// Verify that no aliases exist.
			Assert.IsTrue(
				string.IsNullOrWhiteSpace(oca.SemanticAliases.Value),
				"Verifying that no aliases exist: ");

		}

		/// <summary>
		/// Test Helper : Clears a Property Alias with test assertions.
		/// </summary>
		public void ClearPropertyAlias(MFBuiltInPropertyDef propDef)
			=> ClearPropertyAlias((int) propDef);

		/// <summary>
		/// Test Helper : Clears a Property Alias with test assertions.
		/// </summary>
		public void ClearPropertyAlias(int propDef)
		{
			// Resolve the PropertyDef.
			PropertyDefAdmin pdAdmin = this.V.PropertyDefOperations.GetPropertyDefAdmin(propDef);

			// Clear the Alias.
			this.Tools.Clear.PropertyAlias(pdAdmin);

			// Verify that no aliases exist.
			Assert.IsTrue(
				string.IsNullOrWhiteSpace(pdAdmin.SemanticAliases.Value),
				"Verifying that no aliases exist: ");
		}

		[TestCase(0)]
		public void Test_018_ClearDefaultObjTypeAlias(int id) => ClearObjTypeAlias(id);

		[TestCase(0)]
		public void Test_019_ClearClassAlias(int id) => ClearClassAlias(id);

		[TestCase(0)]
		public void Test_020_ClearPropertyDefAlias(int id) => ClearPropertyAlias(id);

		#endregion
	}
}