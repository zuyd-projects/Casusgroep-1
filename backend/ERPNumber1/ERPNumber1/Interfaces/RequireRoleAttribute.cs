using System;
using ERPNumber1.Models;

[AttributeUsage(AttributeTargets.Method)]
public class RequireRoleAttribute : Attribute
{
    public Role[] AllowedRoles { get; }

    public RequireRoleAttribute(params Role[] allowedRoles)
    {
        AllowedRoles = allowedRoles;
    }
}