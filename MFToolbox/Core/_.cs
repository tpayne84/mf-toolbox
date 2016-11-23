using System;
using Newtonsoft.Json;

namespace MFToolbox.Core
{
	public static class _
	{
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
